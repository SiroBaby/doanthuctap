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

