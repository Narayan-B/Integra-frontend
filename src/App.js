import RegisterPage from "./components/users/RegisterPage";
import Login from "./components/users/LoginPage";
import { useEffect } from "react";
import { Navbar, Nav } from 'react-bootstrap';
import { Link, useNavigate } from "react-router-dom";
import { Route, Routes } from "react-router-dom";
import { RotatingLines } from "react-loader-spinner";
import axios from "axios";
import Home from "./components/Home";
import SingleChat from "./components/SingleChat";
import { useReducer } from 'react';
import { UserContext } from "./createContext/userContext";
import GroupChat from "./components/GroupChat";

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_USER': {
      return { ...state, user: action.payload };
    }
    case 'LOGIN': {
      return { ...state, setlogin: true };
    }
    case 'LOGOUT': {
      return { ...state, setlogin: false };
    }
    default: {
      return { ...state };
    }
  }
}

function App() {
  const [data, dispatch] = useReducer(reducer, {});
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoggedIn = async () => {
      if (localStorage.getItem('token')) {
        try {
          const response = await axios.get('http://localhost:3250/api/users/account', {
            headers: { Authorization: localStorage.getItem("token") }
          });
          dispatch({ type: "LOGIN" });
          dispatch({ type: "ADD_USER", payload: response.data.user });
        } catch (err) {
          console.log(err);
        }
      }
    };

    checkLoggedIn();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
    navigate("/");
  };

  const handleHome = () => {
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
    navigate("/");
  };

  const token = localStorage.getItem("token");
  const spinner = (
    <div className="spinner-style">
      <RotatingLines
        visible={true}
        height="96"
        width="96"
        strokeColor="blue"
        strokeWidth="5"
        animationDuration="0.75"
        ariaLabel="rotating-lines-loading"
        wrapperStyle={{}}
        wrapperClass=""
      />
    </div>
  );

  return (
    <div style={{ margin: "10px" }}>
      {!data.user && token ? (
        <div className="parent-container">
          {spinner}
        </div>
      ) : (
        <div>
          <div style={{ background: "pink", height: "70px" }}>
            <Navbar>
              <Nav className="me-auto">
                <Nav.Link onClick={handleHome}><Link to="/">Home</Link></Nav.Link>
              </Nav>
              {data.setlogin ? (
                <Nav>
                  <Nav.Link onClick={handleLogout}>Log Out</Nav.Link>
                </Nav>
              ) : (
                <Nav>
                  <Nav.Link><Link to="/register">Register</Link></Nav.Link>
                  <Nav.Link><Link to="/login">Login</Link></Nav.Link>
                </Nav>
              )}
            </Navbar>
          </div>
          <UserContext.Provider value={{ data, dispatch }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/userChat" element={<SingleChat />} />
              <Route path="/groupChat" element={<GroupChat />} />
            </Routes>
          </UserContext.Provider>
        </div>
      )}
    </div>
  );
}

export default App;
