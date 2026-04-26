// ==UserScript==
// @name         Xrel.to Search on Scenenzbs
// @namespace    http://tampermonkey.net/
// @version      0.12
// @description        Modify release option links to point to scenenzbs.com search and add custom image link
// @author       blAde
// @match        https://www.xrel.to/*
// @exclude      https://www.xrel.to/forum*
// @exclude      https://www.xrel.to/comments/blog/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const ICON_SRC = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAABXFBMVEUAAADfKBjgKxndGxbgJxjjMB3dLBbrExPgHhThNB7aMx3/AADdCBDhFhPXExPgNR3cORzfPiPFCg3TCBDeBxL/AADfNR3iPyLjQSK3CQnFCw3cCBHdOyLiPyOqCwe6DAvJCg7gDBPfMxvkOiHcOSKMCgCaDgSpDAe9CgrOCQ/eDhHfJxfhNB7jOiFtAACKDgGcCwOwDAi/CgzRCBDgFBTfIhbbKhXiNh/iPCKTDQChDAW1CwjGCQ7iHBbjJhnfKhrkOB/iOByrCQbiMR7hOCCRAACsDQi7CwvcBhHiFRTjKxvjNB7iOiGeDQSrCgbBCwzNBw7fCBHhFxThJBjiLhzjNh/jOiGZAACZAAC2DArACgvXBQ/gBxHhHRbiJRjbKxF/AAC2DAnRBQ7SDw/fGBWwBgbXBxDbBhHeBxLgCRLWBxDiDBO4DQvJCg7aBxHiERTjIBfkKhvNCQ/kIhj59gOiAAAAZnRSTlMAUmMuj6QXDW5EIwE9nA13LDlM3sYDYL5CT/qOHqBF5v2gSuMsMaKMj/5XIK/UB6tDuNL+Y2gkxaw5jlq25+4waCRP9owO0snn7/T84XRJ9KC5z7zo/HEFD5GWZpCUhx0CqFkRSCd8SYRQAAAAAW9yTlQBz6J3mgAAAKhJREFUGNNjYEAARiYGFMDMwsqGzGfnYODkQnC5eXj5GPgFBGF8IWERUQYGMXEJKF9SKk0aSMnIQvly8grpigwMSsoqYK6qmrqGZoYWg7aOLpivp29gaGScaWJqZm4B0WBpZW2TlW1rZ+/gCDXCKSc3L7+g0NkFynd1cy/y8Cz28vaBCvj6+QcEBgWHhIZB+OERkVHRMbFx8QlwZyeGJyWnIPkqPBXZjwDcvRq9+KHFPgAAAABJRU5ErkJggg==";

    function createIcon() {
        const img = document.createElement('img');
        img.src = ICON_SRC;
        img.alt = "Search on scenenzbs.com";
        img.style.verticalAlign = "middle";
        img.style.width = "16px";
        img.style.height = "16px";
        return img;
    }

    // Function to encode URL parameters
    function encodeURIComponentRFC3986(str) {
        return encodeURIComponent(str)
            .replace(/[!'()*]/g, function(c) {
                return '%' + c.charCodeAt(0).toString(16).toUpperCase();
            });
    }

    // Wait for page content to load
    function modifyLinks() {
        // Find all release items (both regular and p2p)
        const releaseItems = document.querySelectorAll('.release_item, .release_item_p2p');
        releaseItems.forEach(item => {
            // Find the release_title or release_title_p2p div
            const titleDiv = item.querySelector('.release_title, .release_title_p2p');
            if (!titleDiv) return;

            // Get the title text from the dirname-truncated link's title attribute
            let titleText = '';
            // Check if there's a dirname-truncated div with an anchor tag that has a title
            const dirnameLink = titleDiv.querySelector('.dirname-truncated a');
            if (dirnameLink && dirnameLink.title) {
                titleText = dirnameLink.title.trim();
            } else {
                // Fallback: get text from the last regular link in release_title
                const titleLinks = titleDiv.querySelectorAll('a');
                if (titleLinks.length > 0) {
                    // Try to get the title attribute first, then text content
                    const lastLink = titleLinks[titleLinks.length - 1];
                    if (lastLink.title) {
                        titleText = lastLink.title.trim();
                    } else {
                        titleText = lastLink.textContent.trim();
                    }
                }
            }

            // Add custom image link after the first link in release_title
            const firstLink = titleDiv.querySelector('a');
            if (firstLink && titleText) {
                // Check if custom link already exists to avoid duplicates
                const existingSnzbLink = titleDiv.querySelector('a[title*="Search on scenenzbs.com"]');
                if (!existingSnzbLink) {
                    const snzbLink = document.createElement('a');
                    snzbLink.href = `https://scenenzbs.com/search?cat=-1&q=${encodeURIComponentRFC3986(titleText)}`;
                    snzbLink.title = `Search on scenenzbs.com: ${titleText}`;
                    snzbLink.style.marginLeft = '5px';
                    snzbLink.style.textDecoration = 'none';
                    snzbLink.appendChild(createIcon());
                    // Insert the new link after the first link
                    firstLink.parentNode.insertBefore(snzbLink, firstLink.nextSibling);
                }
            }
        });

        // Handle NFO title section
        const nfoTitleDiv = document.querySelector('.nfo_title');
        if (nfoTitleDiv) {
            const dirnameSpan = nfoTitleDiv.querySelector('#nfo-view-dirname');
            if (dirnameSpan) {
                const titleText = dirnameSpan.textContent.trim();
                // Check if custom link already exists to avoid duplicates
                const existingSnzbLink = nfoTitleDiv.querySelector('a[title*="Search on scenenzbs.com"]');
                if (!existingSnzbLink) {
                    const snzbLink = document.createElement('a');
                    snzbLink.href = `https://scenenzbs.com/search?cat=-1&q=${encodeURIComponentRFC3986(titleText)}`;
                    snzbLink.title = `Search on scenenzbs.com: ${titleText}`;
                    snzbLink.style.marginLeft = '5px';
                    snzbLink.style.textDecoration = 'none';
                    snzbLink.appendChild(createIcon());
                    // Insert the link after the dirname span
                    dirnameSpan.parentNode.insertBefore(snzbLink, dirnameSpan.nextSibling);
                }
            }
        }

        // Handle extinfo title section
        const extinfoTitleDiv = document.querySelector('#extinfo_title');
        if (extinfoTitleDiv) {
            // Find the anchor tag with the title text
            const titleLink = extinfoTitleDiv.querySelector('h3');
            if (titleLink) {
                const titleText = titleLink.textContent.trim();
                // Check if custom link already exists to avoid duplicates
                const existingSnzbLink = extinfoTitleDiv.querySelector('a[title*="Search on scenenzbs.com"]');
                if (!existingSnzbLink) {
                    const snzbLink = document.createElement('a');
                    snzbLink.href = `https://scenenzbs.com/search?cat=-1&q=${encodeURIComponentRFC3986(titleText)}`;
                    snzbLink.title = `Search on scenenzbs.com: ${titleText}`;
                    snzbLink.style.marginLeft = '5px';
                    snzbLink.style.textDecoration = 'none';
                    snzbLink.appendChild(createIcon());
                    // Insert the link after the anchor tag
                    titleLink.appendChild(snzbLink);
                }
            }
        }

        // Handle new HTML structure for nfo_title div with comments and span containing link
        const nfoTitleDiv2 = document.querySelector('.nfo_title');
        if (nfoTitleDiv2) {
            // Look for the specific pattern
            const titleLink = nfoTitleDiv2.querySelector('.sub a');
            if (titleLink) {
                const titleText = titleLink.textContent.trim();
                // Check if custom link already exists to avoid duplicates
                const existingSnzbLink = nfoTitleDiv2.querySelector('a[title*="Search on scenenzbs.com"]');
                if (!existingSnzbLink) {
                    const snzbLink = document.createElement('a');
                    snzbLink.href = `https://scenenzbs.com/search?cat=-1&q=${encodeURIComponentRFC3986(titleText)}`;
                    snzbLink.title = `Search on scenenzbs.com: ${titleText}`;
                    snzbLink.style.marginLeft = '5px';
                    snzbLink.style.textDecoration = 'none';
                    snzbLink.appendChild(createIcon());
                    // Insert the link after the anchor tag
                    titleLink.parentNode.insertBefore(snzbLink, titleLink.nextSibling);
                }
            }
        }
    }

    // Run immediately and also on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', modifyLinks);
    } else {
        modifyLinks();
    }
})();
