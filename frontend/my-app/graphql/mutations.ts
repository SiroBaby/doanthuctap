import { gql } from '@apollo/client';

//mutation category
//mutation remove category
export const REMOVE_CATEGORY = gql`
    mutation RemoveCategory($id: Int!) {
        removeCategory(id: $id) {
            category_id
            category_name
            create_at
            update_at
        }
    }
`;

//mutation create category
export const CREATE_CATEGORY = gql`
    mutation CreateCategory($createCategoryInput: CreateCategoryInput!) {
        createCategory(createCategoryInput: $createCategoryInput) {
            category_id
            category_name
            create_at
            update_at
        }
    }
`;

//mutation update category
export const UPDATE_CATEGORY = gql`
    mutation UpdateCategory($updateCategoryInput: UpdateCategoryInput!) {
        updateCategory(updateCategoryInput: $updateCategoryInput) {
            category_id
            category_name
            create_at
            update_at
        }
    }
`;

//mutation user
//mutation remove user
export const REMOVE_USER = gql`
    mutation RemoveUser($id: String!) {
        removeUser(id: $id) {
            id_user
            user_name
            email
            status
        }
    }
`;

export const CREATE_PRODUCT_DETAIL = gql`
  mutation CreateProductDetail($createProductDetailInput: CreateProductDetailInput!) {
    createProductDetail(createProductDetailInput: $createProductDetailInput) {
      product_detail_id
      description
      specifications
      create_at
      update_at
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($createProductInput: CreateProductInput!) {
    createProduct(createProductInput: $createProductInput) {
      product_id
      product_name
      brand
      status
      category_id
      product_detail_id
      shop_id
    }
  }
`;

export const CREATE_PRODUCT_IMAGE = gql`
  mutation CreateProductImage($createProductImageInput: CreateProductImageInput!) {
    createProductImage(createProductImageInput: $createProductImageInput) {
      image_id
      product_id
      image_url
      is_thumbnail
      create_at
    }
  }
`;

export const CREATE_PRODUCT_VARIATION = gql`
  mutation CreateProductVariation($createProductVariationInput: CreateProductVariationInput!) {
    createProductVariation(createProductVariationInput: $createProductVariationInput) {
      product_variation_id
      product_variation_name
      base_price
      percent_discount
      stock_quantity
      status
      product_id
      create_at
      update_at
    }
  }
`;

export const CREATE_FULL_PRODUCT = gql`
  mutation CreateFullProduct($createFullProductInput: CreateFullProductInput!) {
    createFullProduct(createFullProductInput: $createFullProductInput) {
      product_id
      product_name
      brand
      status
      category_id
      product_detail_id
      shop_id
    }
  }
`;

//mutation update product
export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($shopid: String!, $updateProductInput: UpdateProductInput!) {
    updateProduct(shopid: $shopid, updateProductInput: $updateProductInput) {
      product_id
      product_name
      brand
      status
    }
  }
`;

//mutation update product detail
export const UPDATE_PRODUCT_DETAIL = gql`
  mutation UpdateProductDetail($updateProductDetailInput: UpdateProductDetailInput!) {
    updateProductDetail(updateProductDetailInput: $updateProductDetailInput) {
      product_detail_id
      description
      specifications
      create_at
      update_at
    }
  }
`;

//mutation update product image
export const UPDATE_PRODUCT_IMAGE = gql`
  mutation UpdateProductImage($updateProductImageInput: UpdateProductImageInput!) {
    updateProductImage(updateProductImageInput: $updateProductImageInput) {
      image_id
      product_id
      image_url
      is_thumbnail
      create_at
    }
  }
`;

//mutation update product variation
export const UPDATE_PRODUCT_VARIATION = gql`
  mutation UpdateProductVariation($updateProductVariationInput: UpdateProductVariationInput!) {
    updateProductVariation(updateProductVariationInput: $updateProductVariationInput) {
      product_variation_id
      product_variation_name
      base_price
      percent_discount
      stock_quantity
      status
      product_id
      create_at
      update_at
    }
  }
`;

//mutation delete product image
export const DELETE_PRODUCT_IMAGE = gql`
  mutation RemoveProductImage($id: Int!) {
    removeProductImage(id: $id) {
      image_id
      product_id
      image_url
      is_thumbnail
      create_at
    }
  }
`;

// Mutation cho shop voucher
export const ADD_SHOP_VOUCHER = gql`
  mutation CreateShopVoucher($createShopVoucherInput: CreateShopVoucherInput!) {
    createShopVoucher(createShopVoucherInput: $createShopVoucherInput) {
      id
      code
      discount_percent
      minimum_require_price
      max_discount_price
      quantity
      max_use_per_user
      valid_from
      valid_to
      shop_id
    }
  }
`;

export const UPDATE_SHOP_VOUCHER = gql`
  mutation UpdateShopVoucher($updateShopVoucherInput: UpdateShopVoucherInput!) {
    updateShopVoucher(updateShopVoucherInput: $updateShopVoucherInput) {
      id
      code
      discount_percent
      minimum_require_price
      max_discount_price
      quantity
      max_use_per_user
      valid_from
      valid_to
      shop_id
    }
  }
`;

export const REMOVE_SHOP_VOUCHER = gql`
  mutation RemoveShopVoucher($id: Int!) {
    removeShopVoucher(id: $id) {
      id
      code
      delete_at
    }
  }
`;

// Shop mutations
export const UPDATE_SHOP = gql`
  mutation UpdateShop($updateShopInput: UpdateShopInput!) {
    updateShop(updateShopInput: $updateShopInput) {
      shop_id
      shop_name
      link
      status
      location_id
      id_user
      update_at
    }
  }
`;

// Shop address mutations
export const CREATE_SHOP_ADDRESS = gql`
  mutation CreateShopAddress($createShopAddressInput: CreateShopAddressInput!) {
    createShopAddress(createShopAddressInput: $createShopAddressInput) {
      address_id
      address
      phone
      shop_id
    }
  }
`;

export const UPDATE_SHOP_ADDRESS = gql`
  mutation UpdateShopAddress($updateShopAddressInput: UpdateShopAddressInput!) {
    updateShopAddress(updateShopAddressInput: $updateShopAddressInput) {
      address_id
      address
      phone
      shop_id
    }
  }
`;

export const REMOVE_SHOP_ADDRESS = gql`
  mutation RemoveShopAddress($id: Int!) {
    removeShopAddress(id: $id) {
      address_id
      address
      phone
    }
  }
`;

export const SET_DEFAULT_SHOP_ADDRESS = gql`
  mutation SetDefaultShopAddress($id: Int!) {
    setDefaultShopAddress(id: $id) {
      address_id
      address
      phone
      shop_id
      is_default
    }
  }
`;

// Invoice mutations
export const UPDATE_INVOICE_STATUS = gql`
  mutation UpdateInvoiceStatus($updateInvoiceStatusInput: UpdateInvoiceStatusInput!) {
    updateInvoiceStatus(updateInvoiceStatusInput: $updateInvoiceStatusInput) {
      invoice_id
      order_status
      update_at
    }
  }
`;

export const CREATE_INVOICE = gql`
  mutation CreateInvoice($createInvoiceInput: CreateInvoiceInput!) {
    createInvoice(createInvoiceInput: $createInvoiceInput) {
      invoice_id
      payment_method
      payment_status
      order_status
      total_amount
      shipping_fee
      id_user
      create_at
      update_at
    }
  }
`;

// mutation cart
// mutation add product to cart
export const ADD_PRODUCT_TO_CART = gql`
mutation AddProductToCart ($product_variation_id: Int!, $cart_id: String!, $quantity: Int!) {
    addProductToCart(
        addProductToCartInput: {
            product_variation_id: $product_variation_id
            cart_id: $cart_id
            quantity: $quantity
            is_selected: false
        }
    ) {
        cart_id
        product_variation_id
        quantity
        create_at
        update_at
        is_selected
    }
}
`;

// mutation remove product variation from cart product
export const REMOVE_PRODUCT_VARIATION_FROM_CART_PRODUCT = gql`
mutation RemoveCartProduct($cartproductid: Int!, $productvariationid: Int!) {
    removeCartProduct(cartproductid: $cartproductid, productvariationid: $productvariationid) {
        cart_product_id
        cart_id
        product_variation_id
        quantity
        create_at
        update_at
        is_selected
    }
}
`;
