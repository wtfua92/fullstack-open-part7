import React, { useEffect, useState } from 'react';
import { useApolloClient } from "@apollo/react-hooks";
import { gql } from 'apollo-boost';
import {GET_BOOKS} from "./Books";

const ME_QUERY = gql`
    query meQuery {
        me {
            favoriteGenre
        }
    }
`;

function Recommended(props) {
    const client = useApolloClient();
    const [favoriteBooks, setFavoriteBooks] = useState([]);
    const [favGenre, setFavGenre] = useState([]);

    useEffect(() => {
        client.query({
            query: ME_QUERY
        }).then(({ data }) => {
            setFavGenre(data.me.favoriteGenre);
            client.query({
                query: GET_BOOKS,
                variables: {
                    genre: data.me.favoriteGenre
                }
            }).then(({data}) => {
                setFavoriteBooks(data.allBooks);
            });
        });
    }, []);

    if (!props.show) {
        return null;
    }

    return (
        <div>
            <h3>books in your favorite genre: {favGenre}</h3>
            <ul>
                {
                    favoriteBooks.length >= 0 && favoriteBooks.map((b) => <li key={b.title}>{ b.title } by {b.author.name} ({b.published})</li>)
                }
            </ul>
        </div>
    );
}

export default Recommended;