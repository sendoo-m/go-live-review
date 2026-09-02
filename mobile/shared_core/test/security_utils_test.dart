import 'package:flutter_test/flutter_test.dart';
import 'package:daleel_core/daleel_core.dart';

void main() {
  group('SecurityUtils URL & Sanitization Tests', () {
    test('isSafeUrl allows safe protocols', () {
      expect(SecurityUtils.isSafeUrl('https://dalilaykhidma.com/activities/10'), isTrue);
      expect(SecurityUtils.isSafeUrl('http://dalilaykhidma.com'), isTrue);
      expect(SecurityUtils.isSafeUrl('tel:+201012345678'), isTrue);
      expect(SecurityUtils.isSafeUrl('mailto:sendoo.m@gmail.com'), isTrue);
      expect(SecurityUtils.isSafeUrl('whatsapp://send?phone=201012345678'), isTrue);
      expect(SecurityUtils.isSafeUrl('sms:+201012345678'), isTrue);
      expect(SecurityUtils.isSafeUrl('geo:30.0444,31.2357'), isTrue);
    });

    test('isSafeUrl rejects malicious, dangerous, or malformed URL schemes', () {
      expect(SecurityUtils.isSafeUrl('javascript:alert(document.cookie)'), isFalse);
      expect(SecurityUtils.isSafeUrl('file:///etc/passwd'), isFalse);
      expect(SecurityUtils.isSafeUrl('content://media/external/images'), isFalse);
      expect(SecurityUtils.isSafeUrl('data:text/html,<script>alert(1)</script>'), isFalse);
      expect(SecurityUtils.isSafeUrl('blob:https://evil.com/uuid'), isFalse);
      expect(SecurityUtils.isSafeUrl(''), isFalse);
      expect(SecurityUtils.isSafeUrl('   '), isFalse);
      expect(SecurityUtils.isSafeUrl(null), isFalse);
      expect(SecurityUtils.isSafeUrl('invalid-url-without-scheme'), isFalse);
    });

    test('sanitizePhoneNumber removes spaces and illegal characters safely', () {
      expect(SecurityUtils.sanitizePhoneNumber(' +20 101 234 5678 '), '+201012345678');
      expect(SecurityUtils.sanitizePhoneNumber('(010) 1234-5678'), '01012345678');
      expect(SecurityUtils.sanitizePhoneNumber(''), isNull);
      expect(SecurityUtils.sanitizePhoneNumber(null), isNull);
    });
  });
}
