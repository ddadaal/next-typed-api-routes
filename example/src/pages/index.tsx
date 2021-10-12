import type { NextPage } from "next";
import { useState } from "react";
import { api } from "src/apis/api";

const Home: NextPage = () => {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div>
      <h1>next-typed-api-routes example</h1>
      <div>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const resp =
           await api.login({ query: { username, password, testNumberQuery: 3 } })
             .httpError(401, ({ reason }) => {
               alert("Failed. Reason: " + reason);
             });
          alert("Success. Token: " + resp.token);
        }}
        >
          <label htmlFor="Email">Email</label>
          <input
            id="username"
            placeholder="Must be in email format"
            onChange={(e) => setUsername(e.target.value)}
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            placeholder="Must be with length >= 8"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
