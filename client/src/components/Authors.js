import React, { useState } from 'react';
import { gql } from 'apollo-boost';
import { useQuery, useMutation } from "@apollo/react-hooks";

export const GET_AUTHORS = gql`
    query {
      allAuthors {
        name
        born
        bookCount
      }
    }
`;

export const ADD_YEAR = gql`  
  mutation addAuthorYear($authorName: String!, $authorYear: Int!) {
    editAuthor(name: $authorName, setToBorn: $authorYear) {
      name
    }
  }
`;

const Authors = (props) => {
  const token = localStorage.getItem('book-app-user-token');
  const [authorYear, setAuthorYear] = useState('');
  const [authorName, setAuthorName] = useState('');
  const {loading, data} = useQuery(GET_AUTHORS);
  const [addAuthorYear] = useMutation(ADD_YEAR);

  const addYearHandler = async (e) => {
    e.preventDefault();
    await addAuthorYear({
      variables: {
        authorName,
        authorYear: +authorYear
      },
      refetchQueries: [{ query: GET_AUTHORS }]
    });

    setAuthorName('');
    setAuthorYear('');
  };

  if (!props.show) {
    return null
  }

  return loading ? <div>loading</div> :
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {data.allAuthors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      {token && <div>
        <form onSubmit={addYearHandler}>
          <label htmlFor="author-name">Author's name: </label>
          <select id="author-name" value={authorName} onChange={(e) => { setAuthorName(e.target.value) }}>
            <option>Select an author</option>
            {
              data.allAuthors.map((a, i) => (<option key={a.name} value={a.name}>{a.name}</option>))
            }
          </select>
          <br/>
          <label htmlFor="author-year">Author's year: </label>
          <input type="number" id="author-year" value={authorYear} onChange={(e) => { setAuthorYear(e.target.value) }}/>
          <br/>
          <button type="submit">Add year</button>
        </form>
      </div>}
    </div>
};

export default Authors