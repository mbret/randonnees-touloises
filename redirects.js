const redirects = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header',
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  /**
   * Both sitemaps used to be served from their own address, and both are
   * submitted to Search Console. app/sitemap.ts serves one sitemap from the
   * standard address instead, so the two old ones point at it rather than
   * turning a crawler that still holds them into a 404.
   */
  const retiredSitemaps = ['/pages-sitemap.xml', '/posts-sitemap.xml'].map((source) => ({
    destination: '/sitemap.xml',
    permanent: true,
    source,
  }))

  const redirects = [internetExplorerRedirect, ...retiredSitemaps]

  return redirects
}

export default redirects
