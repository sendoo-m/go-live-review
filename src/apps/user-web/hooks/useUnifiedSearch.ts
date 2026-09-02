// ============================================================================
// Daleel Ay Khidma - useUnifiedSearch Hook
// Centralized state & API queries for unified search (Products + Shops + Services)
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "../../../packages/api-client";
import {
  UnifiedSearchItemDTO,
  UnifiedSearchResultDTO,
  SearchFilterParams,
  CategoryDTO,
  LocationDTO,
} from "../../../packages/types";

export interface UseUnifiedSearchOptions {
  initialSearch?: string;
  initialItemType?: string;
  initialCategoryId?: string | number;
  initialLocationId?: string | number;
  initialHasDelivery?: boolean;
  initialMinPrice?: number;
  initialMaxPrice?: number;
  initialSortBy?: string;
  pageSize?: number;
  autoFetch?: boolean;
}

export function useUnifiedSearch(options: UseUnifiedSearchOptions = {}) {
  const {
    initialSearch = "",
    initialItemType = "all",
    initialCategoryId = "all",
    initialLocationId = "all",
    initialHasDelivery = false,
    initialMinPrice,
    initialMaxPrice,
    initialSortBy = "recommended",
    pageSize = 30,
    autoFetch = true,
  } = options;

  // Filter States
  const [q, setQ] = useState<string>(initialSearch);
  const [itemType, setItemType] = useState<string>(initialItemType);
  const [categoryId, setCategoryId] = useState<string>(
    initialCategoryId ? String(initialCategoryId) : "all"
  );
  const [locationId, setLocationId] = useState<string>(
    initialLocationId ? String(initialLocationId) : "all"
  );
  const [hasDelivery, setHasDelivery] = useState<boolean>(initialHasDelivery);
  const [minPrice, setMinPrice] = useState<number | undefined>(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialMaxPrice);
  const [sortBy, setSortBy] = useState<string>(initialSortBy);
  const [page, setPage] = useState<number>(1);

  // Geo Location States
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(50);

  // Result States
  const [items, setItems] = useState<UnifiedSearchItemDTO[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [shopsCount, setShopsCount] = useState<number>(0);
  const [servicesCount, setServicesCount] = useState<number>(0);
  const [productsCount, setProductsCount] = useState<number>(0);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Meta States
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [locations, setLocations] = useState<LocationDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load Categories & Locations once
  useEffect(() => {
    let isMounted = true;
    async function loadMetadata() {
      try {
        const [catsRes, locsRes] = await Promise.all([
          api.getCategories(),
          api.getLocations(),
        ]);
        if (isMounted) {
          if (catsRes.data) setCategories(catsRes.data);
          if (locsRes.data) setLocations(locsRes.data);
        }
      } catch (err) {
        console.error("Failed to load metadata in useUnifiedSearch:", err);
      }
    }
    loadMetadata();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Search Data
  const performSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: SearchFilterParams = {
        q: q.trim() || undefined,
        item_type: itemType !== "all" ? itemType : undefined,
        category_id: categoryId !== "all" ? Number(categoryId) : undefined,
        location_id: locationId !== "all" ? Number(locationId) : undefined,
        has_delivery: hasDelivery ? true : undefined,
        min_price: minPrice,
        max_price: maxPrice,
        sort_by: userCoords && sortBy === "distance" ? "distance" : sortBy,
        lat: userCoords?.lat,
        lng: userCoords?.lng,
        radius_km: userCoords ? radiusKm : undefined,
        page,
        per_page: pageSize,
      };

      const res = await api.getUnifiedSearch(params);
      if (res.data) {
        const data = res.data;
        setItems(data.items || []);
        setTotalCount(data.total_count ?? data.stats?.total ?? data.total_results ?? (data.items || []).length);
        setShopsCount(data.shops_count ?? data.stats?.shops_count ?? 0);
        setServicesCount(data.services_count ?? data.stats?.services_count ?? 0);
        setProductsCount(data.products_count ?? data.stats?.products_count ?? 0);
      }
    } catch (err: any) {
      console.error("Error executing unified search:", err);
      setError(err.message || "حدث خطأ أثناء تحميل نتائج البحث.");
    } finally {
      setLoading(false);
    }
  }, [
    q,
    itemType,
    categoryId,
    locationId,
    hasDelivery,
    minPrice,
    maxPrice,
    sortBy,
    userCoords,
    radiusKm,
    page,
    pageSize,
  ]);

  // Execute search when filters change
  useEffect(() => {
    if (autoFetch) {
      performSearch();
    }
  }, [performSearch, autoFetch]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setQ("");
    setItemType("all");
    setCategoryId("all");
    setLocationId("all");
    setHasDelivery(false);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSortBy("recommended");
    setUserCoords(null);
    setRadiusKm(50);
    setPage(1);
    setSelectedItemId(null);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      q.trim() !== "" ||
      itemType !== "all" ||
      categoryId !== "all" ||
      locationId !== "all" ||
      hasDelivery ||
      minPrice !== undefined ||
      maxPrice !== undefined ||
      userCoords !== null
    );
  }, [q, itemType, categoryId, locationId, hasDelivery, minPrice, maxPrice, userCoords]);

  return {
    // States
    q,
    setQ,
    itemType,
    setItemType,
    categoryId,
    setCategoryId,
    locationId,
    setLocationId,
    hasDelivery,
    setHasDelivery,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    sortBy,
    setSortBy,
    page,
    setPage,
    userCoords,
    setUserCoords,
    radiusKm,
    setRadiusKm,
    selectedItemId,
    setSelectedItemId,

    // Data
    items,
    totalCount,
    shopsCount,
    servicesCount,
    productsCount,
    categories,
    locations,
    loading,
    error,
    hasActiveFilters,

    // Actions
    performSearch,
    resetFilters,
  };
}
