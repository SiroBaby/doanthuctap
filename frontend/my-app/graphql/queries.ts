import { gql } from '@apollo/client';

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
