import type { NextPage } from "next";
import { useState } from "react";
import { realApi } from "src/apis/api";
import { HttpError } from "next-typed-api-routes";
import type { LoginSchema } from "src/pages/api/login/[username]";

const Home: NextPage = () => {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div>
      <h1>next-typed-api-routes example</h1>
      <div>
        <form onSubmit={(e) => {
          e.preventDefault();
          realApi.login.login({ query: { username, password } })
            .then((resp) => {
              alert("Success. Token: " + resp.token);
            }).catch((e) => {
              const ex = e as HttpError<LoginSchema["responses"]["401"]>;
              alert("Failed. Reason: " + ex.data?.reason);
            });
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
