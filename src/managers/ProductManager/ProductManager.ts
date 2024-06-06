import {
  COULDNT_FIND_NUMBER_OF_ITEMS_IN_ROW,
  PRODUCTS_CONTAINER_NOT_FOUND,
} from 'consts/messages';
import { DSA_ICON_CLASS, ONET_PRODUCT_CLASS } from 'consts/products';
import { THTMLData } from 'types/HTMLData';
import { TPages } from 'types/pages';
import { TFormattedProduct } from 'types/product';
import getMessage from 'utils/getMessage';
import getProductsCountToInject from 'utils/getProductCountToInject';

class ProductManager {
  private page: TPages;
  private productsContainer: Element;
  private productElements: Element[];
  private productSelector: string;

  constructor(page: TPages, HTMLData: THTMLData) {
    const { productSelector, productsContainerSelector } = HTMLData;

    this.page = page;
    this.productSelector = productSelector;

    const productsContainer = document.querySelector(productsContainerSelector);

    if (!productsContainer) {
      throw new Error(getMessage(PRODUCTS_CONTAINER_NOT_FOUND));
    }

    this.productsContainer = productsContainer;
    this.productElements = Array.from(
      this.productsContainer.querySelectorAll(this.productSelector),
    );
  }

  private deleteExistingProduct = (id: string) => {
    this.productsContainer.querySelector(`.post-${id}`)?.remove();
  };

  private resetRowStyles = () => {
    const productElements = this.productElements;

    for (const productElement of productElements) {
      productElement.classList.remove('first');
      productElement.classList.remove('last');
    }
  };

  private regenerateRowStyles = () => {
    const productElements = Array.from(
      this.productsContainer.querySelectorAll(this.productSelector),
    );
    const containerClasses = Array.from(this.productsContainer.classList);

    const itemsInRow = containerClasses
      .find((className) => className.includes('columns-'))
      ?.match(/columns-(\d+)/)?.[1];

    if (!itemsInRow) {
      throw new Error(getMessage(COULDNT_FIND_NUMBER_OF_ITEMS_IN_ROW));
    }

    for (const [index, productElement] of productElements.entries()) {
      if (index % Number(itemsInRow) === 0) {
        productElement.classList.add('first');
      }

      if (index === 0) continue;

      if ((index + 1) % Number(itemsInRow) === 0) {
        productElement.classList.add('last');
      }
    }
  };

  public injectProducts = async (products: TFormattedProduct[]) => {
    this.resetRowStyles();
    this.deleteExistingSponsoredProducts();

    const productsCountToInject = getProductsCountToInject(this.page);

    for (const [index, product] of products.entries()) {
      if (index >= productsCountToInject) break;

      this.deleteExistingProduct(product.id);

      const dsaIconElement = product.productElement.querySelector(
        `.${DSA_ICON_CLASS}`,
      );

      if (dsaIconElement) {
        dsaIconElement.addEventListener('click', (e) => {
          e.preventDefault();
          window.open(product.dsaUrl, '_blank')?.focus();
        });

        const dsaIconWrapper = dsaIconElement.parentElement as HTMLElement;
        dsaIconWrapper.style.display = 'inline-flex';
        dsaIconWrapper.style.alignItems = 'center';
        dsaIconWrapper.style.gap = '4px';
        dsaIconWrapper.style.wordBreak = 'keep-all';
        dsaIconWrapper.style.padding = '0 4px';
      }

      product.productElement.classList.remove('first');
      product.productElement.classList.add(ONET_PRODUCT_CLASS);
      this.productsContainer.prepend(product.productElement);
      product.renderAd();
    }

    this.regenerateRowStyles();

    if (window?.woodmartThemeModule?.productHover) {
      window.woodmartThemeModule.productHover();
    }
  };

  public deleteExistingSponsoredProducts = () => {
    this.productsContainer
      .querySelectorAll(`.${ONET_PRODUCT_CLASS}`)
      .forEach((product) => {
        product.remove();
      });
  };
}

export default ProductManager;
