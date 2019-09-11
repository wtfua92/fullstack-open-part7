import React, { useState, useEffect } from 'react';
import {gql} from 'apollo-boost';
import {useApolloClient} from "@apollo/react-hooks";
// import {ADD_BOOK} from "./NewBook";

export const GET_BOOKS = gql`
      query booksByGenre($genre: String) {
        allBooks(genre: $genre) {
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
  const [allBooks, setAllBooks] = useState([]);
  const [genre, setGenre] = useState(null);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  const getBooks = async () => {
    const variables = {};
    if (genre) {
      variables.genre = genre;
    }

    const {data} = await client.query({
      query: GET_BOOKS,
      variables
    });
    setLoading(false);
    return data.allBooks
  };

  useEffect(() => {
    getBooks().then((allBooks) => {
      setAllBooks(allBooks);
      if (!genre) {
        setGenres(Array.from(new Set(allBooks.map(b => b.genres).flat())));
      }
    });
  }, [genre]);

  if (!props.show) {
    return null
  }

  // const filterByGenre = async (genre) => {
  //
  //
  //   const {data} = await client.query({
  //     query: FILTERED_BOOKS,
  //     variables: {
  //       genre
  //     },
  //     refetchQueries: [
  //       {
  //         query: FILTERED_BOOKS,
  //         variables: {
  //           genre
  //         }
  //       }
  //     ]
  //   });
  //
  //   setAllBooks(data.allBooks);
  // };

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
          {allBooks.map(a =>
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
          genres.map((g) => <button type="button" onClick={() => { setGenre(g) }} key={g}>{g}</button>)
        }
        <button type="button" onClick={() => { setGenre('') }} >all</button>
      </div>
    </div>
};

export default Books