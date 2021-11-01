// ==UserScript==
// @name            Amazon - hide non Amazon Locker
// @description     Hides Products that don't ship to Amazon Locker, when Amazon Locker is selected as Destination
// @namespace       https://github.com/6uhrmittag
// @author          Marvin Heimbrodt
// @version         0.1
// @license         MIT
// @homepageURL     https://github.com/6uhrmittag/userscript-amazon-hide-non-AmazonLocker
// @supportURL      https://github.com/6uhrmittag/userscript-amazon-hide-non-AmazonLocker/issues
// @updateURL       https://github.com/6uhrmittag/userscript-amazon-hide-non-AmazonLocker/raw/main/amazon-show-seller-info.meta.js
// @downloadURL     https://github.com/6uhrmittag/userscript-amazon-hide-non-AmazonLocker/raw/main/amazon-show-seller-info.user.js
// @match           https://smile.amazon.co.uk/*
// @match           https://www.amazon.co.uk/*
// @match           https://smile.amazon.de/*
// @match           https://www.amazon.de/*
// @match           https://www.amazon.es/*
// @match           https://www.amazon.fr/*
// @match           https://www.amazon.it/*
// ==/UserScript==

// This script is based on Tad Wohlrapp's well written https://github.com/tadwohlrapp/amazon-show-seller-info-userscript

(function () {
    'use strict';

// Check URLs for page type (search result page and best sellers page)
    const isSearchResultPage = window.location.href.match(/.*\.amazon\..*\/s\?.*/);
    const isBestsellersPage = window.location.href.match(/.*\.amazon\..*\/gp\/bestsellers\/.*/) || window.location.href.match(/.*\.amazon\..*\/Best\-Sellers\-.*/);

    const isLockerDestination = document.querySelector('#nav-global-location-popover-link #glow-ingress-line1').textContent.match('Locker');

    if (isLockerDestination) {
        console.info('%cAmazon Locker is selected', 'background: grey;');
    } else {
        console.info('%cAmazon Locker not selected - skipping!', 'background: grey;');
    }

    if (isLockerDestination && (isSearchResultPage || isBestsellersPage)) {
        function showSellerCountry() {

            const products = isSearchResultPage ?
                document.querySelectorAll('h2.a-size-mini.a-spacing-none.a-color-base a.a-link-normal.a-text-normal:not([data-seller])') :
                document.querySelectorAll('span.aok-inline-block.zg-item>a.a-link-normal:not([data-seller])');

            for (let i = 0; i < products.length; i++) {
                const product = products[i];
                product.setAttribute('data-seller', 'set');

                if (product.href && product.href.match(/.*\.amazon\..*\/(.*\/dp|gp\/slredirect)\/.*/)) {

                    fetch(product.href).then(function (response) {
                        if (response.ok) {
                            return response.text();
                        }
                    }).then(function (html) {
                        const productPage = parse(html);

                        let shippingInfo = productPage.querySelector('#desktop_qualifiedBuyBox #mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE, #newAccordionRow #merchant-info a:first-of-type');

                        const outercontainer = isSearchResultPage ?
                            product.closest('.a-carousel-card, .s-result-item') :
                            product.closest('.zg-item-immersion');

                        if (shippingInfo) {
                            let doesntGoToPackstation = shippingInfo.getElementsByClassName('a-color-error');

                            if (doesntGoToPackstation.length > 0) {
                                console.info('%cNot sending to Amazon Locker - hiding.', 'background: grey;');
                                outercontainer.classList.add('hideNonAmazonLocker');

                            } else {
                                console.info('%cSending to Amazon Locker!', 'background: grey;');
                            }
                        } else {
                            console.info('%cNot sure if sending to Amazon Locker - keeping product', 'background: grey;');
                        }
                    });
                }
            }

        }

        // Run script once on document ready
        showSellerCountry();

        // Initialize new MutationObserver
        const mutationObserver = new MutationObserver(showSellerCountry);

        // Let MutationObserver target the grid containing all thumbnails
        const targetNode = document.body;

        const mutationObserverOptions = {
            childList: true,
            subtree: true
        }

        // Run MutationObserver
        mutationObserver.observe(targetNode, mutationObserverOptions);

        function parse(html) {
            const parser = new DOMParser();
            return parser.parseFromString(html, 'text/html');
        }

        function addGlobalStyle(css) {
            const head = document.getElementsByTagName('head')[0];
            if (!head) {
                return;
            }
            const style = document.createElement('style');
            style.innerHTML = css;
            head.appendChild(style);
        }

        addGlobalStyle(`
    .hideNonAmazonLocker{
    display: none;
    background-color: red;
    }
    #zg-center-div .zg-item-immersion {
        height: 390px;
    }
    }
    `);
    }
})();
