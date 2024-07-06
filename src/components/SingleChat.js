import { useEffect, useState, useMemo } from 'react';
import { Form, Col, Button, Row, Card } from 'react-bootstrap';
import { io } from 'socket.io-client';
import { useContext } from 'react';
import { UserContext } from '../createContext/userContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SingleChat() {
  const [message, setMessage] = useState('');
  const [msgs, setMessages] = useState([]);
  const [connections, setConnections] = useState([]);
  const [receiverId, setReceiverId] = useState('');
  const navigate = useNavigate();
  //user data
  const { data } = useContext(UserContext);

  const socket = useMemo(() => io("http://localhost:3330"), []);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get('http://localhost:3330/api/users', {
          headers: {
            Authorization: localStorage.getItem('token')
          }
        });
        setConnections(response.data);
      } catch (err) {
        alert(err.message);
      }
    })();

    (async () => {
      try {
        const response = await axios.get('http://localhost:3330/api/users/messages', {
          headers: {
            Authorization: localStorage.getItem('token')
          }
        });
        console.log(response.data);
        setMessages(response.data);
      } catch (err) {
        alert(err.message);
      }
    })();

    //to join first time
    socket.on('connect', () => {
      socket.emit('join', { roomId: data.user._id });
    });

    //to handle received message
    socket.on('receive_message', (data) => {
      console.log(data, 'received');
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [socket, data.user._id]);

  const handleSend = (e) => {
    e.preventDefault();
    const msg = { receiverId, senderId: data.user._id, message, room: `${receiverId}${data.user._id}` };
    setMessages([...msgs, msg]);
    socket.emit('message_sent', msg);
    setMessage('');
  };

  const handleGroup = () => {
    navigate('/groupChat');
  };

  const handleButtonUser = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setReceiverId(id);
  };

  console.log(msgs, 'messages');
  return (
    <div>
      <Form className='form-control'>
        <h2>Hi ! {data.user.name}</h2>
        <Form.Group as={Row} controlId="formDescription">
          <Col className="col-md-4">
            <Form.Label column sm={2}>
              {
                connections.map((ele) => {
                  return (
                    <Card
                      style={{ width: '15rem', height: "3rem", textAlign: "center" }}
                      key={ele._id}
                      onClick={(e) => handleButtonUser(e, ele._id)}
                    >
                      {ele.name}
                    </Card>
                  );
                })
              }
              <Card
                style={{ width: '15rem', height: "3rem", textAlign: "center", background: "coral" }}
                onClick={handleGroup}
              >
                For Groups
              </Card>
            </Form.Label>
          </Col>
          <Col sm={8} style={{ border: "1px solid lightgrey", borderRadius: "8px" }}>
            {receiverId && msgs.filter((ele) => ele?.room?.includes(receiverId)).map((ele, i) => {
              const isSender = ele.senderId === data.user._id;
              return (
                <p
                  key={i}
                  style={{
                    background: isSender ? "#007bff" : "#28a745",
                    padding: "10px",
                    margin: isSender ? "10px 10px 10px auto" : "10px auto 10px 10px",
                    borderRadius: "10px",
                    width: "fit-content",
                    maxWidth: "70%",
                    color: "white",
                    textAlign: "left",
                    alignSelf: isSender ? "flex-end" : "flex-start",
                  }}
                >
                  {ele.message}
                </p>
              );
            })}
            <Form.Control
              className='form-control'
              style={{ margin: "10px" }}
              as="textarea"
              value={message}
              placeholder="message"
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button style={{ width: "20%" }} variant="primary" type="submit" onClick={handleSend}>
              Send
            </Button>
          </Col>
        </Form.Group>
      </Form>
    </div>
  );
}
