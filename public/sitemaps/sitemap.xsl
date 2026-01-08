<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">

  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Sitemap | CAR BOUTIQUE</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 24px; color: #111; }
          h1 { font-size: 20px; margin: 0 0 12px; }
          p { margin: 6px 0 16px; color: #444; }
          table { width: 100%; border-collapse: collapse; }
          th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #e6e6e6; vertical-align: top; }
          th { font-size: 12px; color: #666; font-weight: 600; }
          td { font-size: 14px; }
          a { color: #0b6; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .muted { color: #777; font-size: 12px; }
          .empty { padding: 12px; background: #f6f7f9; border: 1px solid #e6e6e6; border-radius: 8px; }
        </style>
      </head>
      <body>
        <h1>CAR BOUTIQUE Sitemap</h1>

        <xsl:choose>
          <!-- Sitemap Index -->
          <xsl:when test="sitemap:sitemapindex">
            <p>
              <span class="muted">Sitemap files: </span>
              <xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)" />
            </p>

            <table>
              <thead>
                <tr>
                  <th>Sitemap</th>
                  <th>Last Modified</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                  <tr>
                    <td>
                      <a>
                        <xsl:attribute name="href">
                          <xsl:value-of select="sitemap:loc" />
                        </xsl:attribute>
                        <xsl:value-of select="sitemap:loc" />
                      </a>
                    </td>
                    <td>
                      <xsl:value-of select="sitemap:lastmod" />
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:when>

          <!-- URL Set -->
          <xsl:when test="sitemap:urlset">
            <p>
              <span class="muted">URL entries: </span>
              <xsl:value-of select="count(sitemap:urlset/sitemap:url)" />
            </p>

            <xsl:choose>
              <xsl:when test="count(sitemap:urlset/sitemap:url) &gt; 0">
                <table>
                  <thead>
                    <tr>
                      <th>URL</th>
                      <th>Last Modified</th>
                      <th>Changefreq</th>
                      <th>Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    <xsl:for-each select="sitemap:urlset/sitemap:url">
                      <tr>
                        <td>
                          <a>
                            <xsl:attribute name="href">
                              <xsl:value-of select="sitemap:loc" />
                            </xsl:attribute>
                            <xsl:value-of select="sitemap:loc" />
                          </a>
                        </td>
                        <td><xsl:value-of select="sitemap:lastmod" /></td>
                        <td><xsl:value-of select="sitemap:changefreq" /></td>
                        <td><xsl:value-of select="sitemap:priority" /></td>
                      </tr>
                    </xsl:for-each>
                  </tbody>
                </table>
              </xsl:when>
              <xsl:otherwise>
                <div class="empty">
                  This sitemap is currently empty (0 URLs).
                </div>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:when>

          <xsl:otherwise>
            <div class="empty">
              Unknown sitemap format.
            </div>
          </xsl:otherwise>
        </xsl:choose>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
