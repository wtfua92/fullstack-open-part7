import React, { useState } from 'react';
import {gql} from 'apollo-boost';
import {useApolloClient, useQuery} from "@apollo/react-hooks";

export const GET_BOOKS = gql`
    query getBooks {
      allBooks {
        title
        published
        genres
        author {
          name
        }
      }
    }
`;

const Books = (props) => {
  const client = useApolloClient();
  const {loading, data} = useQuery(GET_BOOKS);
  const [allBooks, setAllBooks] = useState([]);

  if (!props.show) {
    return null
  }

  if (!loading) {
    setAllBooks(data.allBooks);
  }

  const genres = Array.from(new Set(data.allBooks.map(b => b.genres).flat()));

  const filterByGenre = (genre) => {

  };

  return loading ? <div>loading</div> :
    <div>
      <h2>books</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {data.allBooks.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      <div>
        {
          genres.length > 0 && genres.map((g) => <button type="button" key={g}>{g}</button>)
        }
      </div>
    </div>
};

export default Books