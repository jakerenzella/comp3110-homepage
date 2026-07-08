/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static site — emits an `out/` directory deployable to any static host.
  output: 'export',

  // GitHub Pages serves project sites under a sub-path. If you deploy to
  // https://<user>.github.io/<repo>/ , uncomment and set these to '/<repo>'.
  // TODO: set basePath/assetPrefix to '/course-site' (or your repo name) for GitHub Pages.
  // basePath: '/course-site',
  // assetPrefix: '/course-site',

  images: {
    // next/image optimization needs a server; static export requires unoptimized.
    unoptimized: true,
  },

  // Emit /projects/foo/index.html so links work without a server rewrite layer.
  trailingSlash: true,
}

export default nextConfig
