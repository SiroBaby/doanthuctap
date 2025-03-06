import { gql } from '@apollo/client';

//query user
//query get users
export const GET_USERS = gql`
  query Users($page: Int!, $limit: Int!, $search: String!) {
    users(pagination: { page: $page, limit: $limit, search: $search }) {
      data {
        id_user
        user_name
        email
        status
      }
      totalCount
      totalPage
    }
  }
`;

//query get user by id
export const GET_USER_BY_ID = gql`
  query User($id: String!) {
    user(id: $id) {
        id_user
        user_name
        email
        password
        phone
        status
        role
        create_at
        update_at
    }
  }
`;

//query shop
//query get shops
export const GET_SHOPS = gql`
  query Shops($page: Int!, $limit: Int!, $search: String) {
      shops(pagination: { page: $page, limit: $limit, search: $search }) {
          totalCount
          totalPage
          data {
              shop_id
              id_user
              shop_name
              status
              location_id
          }
      }
  }
`;

//query get shop by id
export const GET_SHOP_BY_ID = gql`
    query Shop {
        shop(id: "shop_abc") {
            shop_id
            id_user
            shop_name
            link
            status
            location_id
            create_at
            update_at
            delete_at
            shop_addresses {
                address_id
                shop_id
                address
                phone
            }
            products {
                product_id
                product_name
                brand
                status
                product_images {
                    image_url
                    is_thumbnail
                }
            }
            user {
                id_user
                user_name
            }
            shop_vouchers {
                id
                code
                discount_percent
                valid_from
                valid_to
                minimum_require_price
                max_discount_price
            }
            location {
                location_id
                location_name
            }
        }
    }
`;

//query category
//query get categories
export const GET_CATEGORIES = gql`
  query Categorys($page: Int!, $limit: Int!, $search: String) {
    categorys(pagination: { limit: $limit, page: $page, search: $search }) {
      totalCount
      totalPage
      data {
        category_id
        category_name
        create_at
        update_at
      }
    }
  }
`;

//query get category by id
export const GET_CATEGORY_BY_ID = gql`
    query Category($id: Int!) {
        category(id: $id) {
            category_id
            category_name
            create_at
            update_at
        }
    }
`;

//query product
//query get products
export const GET_PRODUCTS = gql`
  query Products($page: Int!, $limit: Int!, $search: String) {
      products(pagination: { page: $page, limit: $limit, search: $search }) {
          totalCount
          totalPage
          data {
              product_id
              product_name
              brand
              status
              shop {
                  shop_name
              }
              category {
                  category_name
              }
          }
      }
  }
`; 
//query get product by id
export const GET_PRODUCT_BY_ID = gql`
  query Product ($id: Int!) {
      product(id: $id) {
          product_id
          product_name
          brand
          status
          product_detail_id
          category {
              category_name
          }
          shop {
              shop_id
              id_user
              shop_name
              link
              status
              location_id
              create_at
              update_at
              delete_at
          }
          product_detail {
              product_detail_id
              description
              specifications
              create_at
              update_at
          }
          product_variations {
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
          product_images {
              image_id
              product_id
              image_url
              is_thumbnail
              create_at
          }
      }
  }
`;