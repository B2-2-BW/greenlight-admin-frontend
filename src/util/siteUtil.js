export function getAccessibleSites(user) {
  if (Array.isArray(user?.sites) && user.sites.length > 0) {
    return user.sites.filter((site) => site?.siteId);
  }
  if (Array.isArray(user?.siteIds) && user.siteIds.length > 0) {
    return user.siteIds.filter(Boolean).map((siteId) => ({
      siteId,
      siteName: siteId === user?.siteId ? user?.siteName : siteId,
      siteEnabled: true,
    }));
  }
  if (user?.siteId) {
    return [{ siteId: user.siteId, siteName: user.siteName, siteEnabled: true }];
  }
  return [];
}

export function getAccessibleSiteIds(user) {
  return getAccessibleSites(user).map((site) => site.siteId);
}

export function getEffectiveSiteId(user, selectedSiteId) {
  const role = user?.userRole ?? user?.role;
  if (role === 'SUPER') {
    return selectedSiteId || user?.siteId || null;
  }
  const accessible = getAccessibleSiteIds(user);
  if (selectedSiteId && accessible.includes(selectedSiteId)) {
    return selectedSiteId;
  }
  const enabled = getAccessibleSites(user)
    .filter((site) => site.siteEnabled !== false)
    .map((site) => site.siteId);
  if (user?.siteId && enabled.includes(user.siteId)) {
    return user.siteId;
  }
  return enabled[0] || accessible[0] || user?.siteId || null;
}

export function canSwitchSites(user) {
  const role = user?.userRole ?? user?.role;
  return role === 'SUPER' || getAccessibleSiteIds(user).length > 1;
}

export function getVisibleSites(user, viewer) {
  const sites = getAccessibleSites(user);
  const role = viewer?.userRole ?? viewer?.role;
  if (!viewer || role === 'SUPER') {
    return sites;
  }
  const allowed = new Set(getAccessibleSiteIds(viewer));
  if (allowed.size === 0) {
    return sites;
  }
  return sites.filter((site) => allowed.has(site.siteId));
}

export async function loadGrantableSites(viewer, getSites, signal) {
  const role = viewer?.userRole ?? viewer?.role;
  if (role !== 'SUPER') {
    return getAccessibleSites(viewer);
  }
  const firstResponse = await getSites({ page: 1, size: 100, signal });
  const firstPage = firstResponse.data ?? {};
  const remainingResponses = await Promise.all(
    Array.from({ length: Math.max(0, (firstPage.totalPages ?? 1) - 1) }, (_, index) =>
      getSites({ page: index + 2, size: 100, signal })
    )
  );
  return [
    ...(firstPage.content ?? []),
    ...remainingResponses.flatMap((response) => response.data?.content ?? []),
  ];
}
