import 'dart:async';
import 'package:dio/dio.dart';
import '../storage/secure_token_storage.dart';
import '../monitoring/app_logger.dart';
import '../monitoring/crash_reporting_service.dart';
import '../analytics/analytics_service.dart';
import '../analytics/analytics_events.dart';
import '../security/security_utils.dart';
import 'api_endpoints.dart';

class ApiResponse<T> {
  final bool success;
  final String message;
  final T? data;
  final String? errorCode;
  final dynamic meta;

  ApiResponse({
    required this.success,
    this.message = '',
    this.data,
    this.errorCode,
    this.meta,
  });

  factory ApiResponse.fromJson(Map<String, dynamic> json, T Function(dynamic)? dataTransformer) {
    return ApiResponse<T>(
      success: json['success'] == true || json['status'] == 'success',
      message: json['message'] ?? '',
      data: json['data'] != null && dataTransformer != null ? dataTransformer(json['data']) : json['data'] as T?,
      errorCode: json['error_code'],
      meta: json['meta'],
    );
  }
}

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  late final Dio _dio;
  final SecureTokenStorage _tokenStorage = SecureTokenStorage();

  // Centralized session expiration stream
  final _sessionExpiredController = StreamController<void>.broadcast();
  Stream<void> get onSessionExpired => _sessionExpiredController.stream;

  void triggerSessionExpired() {
    _sessionExpiredController.add(null);
  }

  ApiClient._internal() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiEndpoints.baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Accept-Language': 'ar',
          'X-Client-Platform': 'flutter-mobile',
        },
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _tokenStorage.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }

          AppLogger.debug('HTTP ${options.method} -> ${options.path}', tag: 'NETWORK');
          CrashReportingService().addBreadcrumb(
            category: 'network.request',
            message: '${options.method} ${options.path}',
          );

          return handler.next(options);
        },
        onResponse: (response, handler) {
          AppLogger.debug('HTTP ${response.statusCode} <- ${response.requestOptions.path}', tag: 'NETWORK');
          return handler.next(response);
        },
        onError: (DioException error, handler) async {
          final path = error.requestOptions.path;
          final status = error.response?.statusCode;
          AppLogger.warning('HTTP Error [$status] on $path: ${error.message}', tag: 'NETWORK', error: error);

          // Centralized 401 Unauthorized handling
          if (status == 401) {
            // Avoid triggering 401 loop on login endpoint itself
            if (!path.contains('/auth/login') && !path.contains('/auth/register')) {
              AppLogger.warning('Session expired (401 received). Purging credentials.', tag: 'SECURITY');
              await SecurityUtils.wipeSessionData();
              AnalyticsService().logEvent(AnalyticsEvents.sessionExpired);
              _sessionExpiredController.add(null);
            }
          }
          return handler.next(error);
        },
      ),
    );
  }

  Dio get dio => _dio;

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.get<T>(path, queryParameters: queryParameters, options: options);
  }

  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.post<T>(path, data: data, queryParameters: queryParameters, options: options);
  }

  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.put<T>(path, data: data, queryParameters: queryParameters, options: options);
  }

  Future<Response<T>> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.patch<T>(path, data: data, queryParameters: queryParameters, options: options);
  }

  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.delete<T>(path, data: data, queryParameters: queryParameters, options: options);
  }

  Future<Response<T>> uploadFile<T>(
    String path, {
    required dynamic file,
    String fileKey = 'image',
    String? fileName,
    Map<String, dynamic>? extraFields,
  }) async {
    FormData formData;
    if (file is MultipartFile) {
      formData = FormData.fromMap({
        fileKey: file,
        if (extraFields != null) ...extraFields,
      });
    } else if (file is String) {
      // If path string or base64
      if (file.startsWith('data:') || file.startsWith('http')) {
        formData = FormData.fromMap({
          fileKey: file,
          if (extraFields != null) ...extraFields,
        });
      } else {
        final multipart = await MultipartFile.fromFile(file, filename: fileName);
        formData = FormData.fromMap({
          fileKey: multipart,
          if (extraFields != null) ...extraFields,
        });
      }
    } else {
      formData = FormData.fromMap({
        fileKey: file,
        if (extraFields != null) ...extraFields,
      });
    }

    return await _dio.post<T>(
      path,
      data: formData,
      options: Options(
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      ),
    );
  }

  /// Direct PUT upload of binary data to Cloudflare R2 via presigned URL
  Future<bool> directUploadBinary(
    String presignedUrl, {
    required List<int> bytes,
    String mimeType = 'image/jpeg',
    Function(double progress)? onProgress,
  }) async {
    try {
      final dioInstance = Dio();
      final response = await dioInstance.put(
        presignedUrl,
        data: Stream.fromIterable([bytes]),
        options: Options(
          headers: {
            'Content-Type': mimeType,
            'Content-Length': bytes.length.toString(),
          },
        ),
        onSendProgress: (count, total) {
          if (total > 0 && onProgress != null) {
            onProgress(count / total);
          }
        },
      );
      return response.statusCode == 200 || response.statusCode == 204;
    } catch (e) {
      return false;
    }
  }
}
