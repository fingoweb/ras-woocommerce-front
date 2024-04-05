import { NOT_SUPPORTED_THEME } from 'consts/messages';
import { BLOCK_THEME_CLASS } from 'consts/pages';
import { initAdManager } from 'managers/AdManager/AdManager.util';
import { initProductManager } from 'managers/ProductManager/ProductManager.utils';
import getCurrentPageInfo from 'utils/getCurrentPageInfo';
import getMessage from 'utils/getMessage';
import { hideLoadingSpinner, showLoadingSpinner } from 'utils/loadingSpinner';
import waitForDlApi from 'utils/waitForDlApi';

window.sponsoredProductConfig = {
  isLoaderVisible: true,
  tagLabel: 'SPONSOROWANE',

  mainPage: {
    isEnabled: true,
    productsCount: 3,
  },
  pageDetails: {
    isEnabled: true,
    productsCount: 3,
  },
  productsList: {
    isEnabled: true,
    productsCount: 3,
  },
};

const isBlockTheme = document.body.classList.contains(BLOCK_THEME_CLASS);

if (isBlockTheme) {
  console.error(getMessage(NOT_SUPPORTED_THEME));
} else {
  if (window.sponsoredProductConfig.isLoaderVisible) {
    showLoadingSpinner();
  }

  const runApp = async (isFromBFCache?: boolean) => {
    try {
      const page = getCurrentPageInfo();

      if (!page) return;

      await waitForDlApi();

      const AdManager = initAdManager(page);
      const products = await AdManager.getPromotedProducts();

      const ProductManager = initProductManager(page);

      if (isFromBFCache) {
        ProductManager.deleteExistingSponsoredProducts();
      }

      ProductManager.injectProducts(products);
      hideLoadingSpinner();
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
        hideLoadingSpinner();
      }
    }
  };

  if (document.readyState !== 'loading') {
    runApp();
  } else {
    window.addEventListener('DOMContentLoaded', async () => {
      runApp();
    });
  }

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      if (window.sponsoredProductConfig.isLoaderVisible) {
        showLoadingSpinner();
      }

      runApp(true);
    }
  });
}
