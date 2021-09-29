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
           await api.login({ query: { username, password } })
             .httpError(401, ({ reason }) => {
               alert("Failed. Reason: " + reason);
             });
          alert("Success. Token: " + resp.token);
        }}
        >
          <label htmlFor="username">Username</label>
          <input id="username" onChange={(e) => setUsername(e.target.value)} />
          <label htmlFor="password">Password</label>
          <input id="password" onChange={(e) => setPassword(e.target.value)} />
          <button type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
