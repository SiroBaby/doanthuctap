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
