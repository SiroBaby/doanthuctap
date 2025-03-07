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

//mutation voucher
//mutation add voucher
export const ADD_VOUCHER = gql`
    mutation CreateVoucher ($createVoucherInput: CreateVoucherInput!) {
        createVoucher(createVoucherInput: $createVoucherInput) {
                code
                discount_percent
                minimum_require_price
                max_discount_price
                quantity
                max_use_per_user
                valid_from
                valid_to
        }
    }
`;

//mutation remove voucher
export const REMOVE_VOUCHER = gql`
    mutation RemoveVoucher($id: Int!) {
        removeVoucher(id: $id) {
            id
            code
            discount_percent
            minimum_require_price
            max_discount_price
            quantity
            max_use_per_user
            valid_from
            valid_to
        }
    }
`;

//mutation update voucher
export const UPDATE_VOUCHER = gql`
    mutation UpdateVoucher($updateVoucherInput: UpdateVoucherInput!) {
        updateVoucher(updateVoucherInput: $updateVoucherInput) {
            id
            code
            discount_percent
            minimum_require_price
            max_discount_price
            quantity
            max_use_per_user
            valid_from
            valid_to
        }
    }
`;