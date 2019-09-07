import React, { useState } from 'react';
import {useMutation} from "@apollo/react-hooks";
import {gql} from 'apollo-boost';
import {GET_AUTHORS} from "./Authors";
import {GET_BOOKS} from "./Books";

const ADD_BOOK = gql`
  mutation addNewBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
    addBook(published: $published, title: $title, author: $author, genres: $genres) {
      title
    }
  }
`;

const NewBook = (props) => {
  const [title, setTitle] = useState('');
  const [author, setAuhtor] = useState('');
  const [published, setPublished] = useState('');
  const [genre, setGenre] = useState('');
  const [genres, setGenres] = useState([]);

  const [ addNewBook ] = useMutation(ADD_BOOK);

  if (!props.show) {
    return null;
  }

  const submit = async (e) => {
    e.preventDefault();

    await addNewBook({
      variables: {
        title, author, published: +published, genres
      },
      refetchQueries: [
        { query: GET_BOOKS },
        { query: GET_AUTHORS }
      ]
    });

    setTitle('');
    setPublished('');
    setAuhtor('');
    setGenres([]);
    setGenre('');
  };

  const addGenre = () => {
    setGenres(genres.concat(genre));
    setGenre('')
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuhtor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type='number'
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">add genre</button>
        </div>
        <div>
          genres: {genres.join(' ')}
        </div>
        <button type='submit'>create book</button>
      </form>
    </div>
  )
};

export default NewBook