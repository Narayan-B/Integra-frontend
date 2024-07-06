import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { Container, Form, Col, Row, Card } from 'react-bootstrap'
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { io } from 'socket.io-client'
import { useContext } from 'react'
import { UserContext } from '../createContext/userContext'
import { useNavigate } from "react-router-dom";
export default function GroupChat() {

    const socket = useMemo(() => io("http://localhost:3330"), [])

    const [modal, setModal] = useState(false);
    const [message, setMessage] = useState('')
    const [groupName, setGroupName] = useState('')
    const [groupId, setGroupId] = useState('')
    const [groups, setGroups] = useState([])
    const [groupMessages, setGroupMessages] = useState([])
    const navigate = useNavigate()
    const toggle = () => setModal(!modal);

    const handleModal = () => {
        toggle()
    }

    //user data
    const { data } = useContext(UserContext)

    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get('http://localhost:3330/api/groups', {
                    headers: {
                        Authorization: localStorage.getItem('token')
                    }
                })
                setGroups(response.data)
            } catch (err) {
                alert(err.message)
            }
        })();

        //socket
        socket.on('new_one', (data)=>{
            console.log(data)
        })
        //to handle received message
        socket.on('group_message_receive', (data) => {
            console.log(data, 'received');
            setGroupMessages((prevMessages) => [...prevMessages, data]);
        });

    }, [])

    const handleGroup = async (e) => {
        e.preventDefault()
        const form = {
            name: groupName,
            members: [].concat(data.user._id)
        }
        setGroupName('')

        try {
            const response = await axios.post('http://127.0.0.1:3330/api/groups', form, {
                headers: {
                    Authorization: localStorage.getItem('token')
                }
            })
            console.log(response)  // create one group 
            setGroups([...groups, response.data])
        } catch (err) {
            console.log(err)
        }

    }

    //adding member to group
    const handleJoin = async (e, user, id) => {
        const form = { user: user }
        try {
            const response = await axios.put(`http://localhost:3330/api/groups/${id}`, form, {
                headers: { Authorization: localStorage.getItem("token") }
            })
            console.log(response.data)
            const arr = groups.map((ele) => {
                if (ele._id === response.data._id) {
                    return response.data
                } else {
                    return ele
                }
            })
            setGroups(arr)
            alert('successfully joined the group')
        } catch (err) { console.log(err) }
    }

    //messages
    const handleSend = (e) => {
        e.preventDefault()
        const msg = { senderName: data.user.name, message, groupId }
        console.log(msg, 'sent', groupId)
        setGroupMessages([...groupMessages, msg])
        socket.emit('group_message_sent', msg);
        setMessage('')
    }

    const handleClick = async(e,id)=>{
        socket.emit('group_join', {id})
        e.stopPropagation()
        setGroupId(id)
        try {
            const response = await axios.get(`http://localhost:3330/api/users/groupMessages/${id}`, {
              headers: {
                Authorization: localStorage.getItem('token')
              }
            })
            console.log(response.data)
            setGroupMessages(response.data)
          } catch (err) {
            alert(err.message)
          }
    }
    const handleSingleChats = ()=>{
        navigate('/userChat')
    }

    return (
        <>  
            <h2>Hi ! {data.user.name}</h2>
            <Button variant="primary" onClick={handleModal} style={{ margin: "10px" }}>Add a Group</Button>
            <Modal isOpen={modal} toggle={toggle}>
                <ModalHeader toggle={toggle}>Add a Group</ModalHeader>
                <ModalBody>
                    <form onSubmit={e => { handleGroup(e) }}>
                        <label>Group Name</label>
                        <input type="text"
                            className='form-control'
                            value={groupName}
                            onChange={e => { setGroupName(e.target.value) }} />
                        <Button variant="primary" type="submit">Submit</Button>
                    </form>
                </ModalBody>
                <ModalFooter>
                </ModalFooter>
            </Modal>
            <Row>
                <Col className="col-md-4">
                {
                groups.map((ele) => {
                    return (<div key={ele._id}> <Card style={{ width: '15rem',height:"3rem",textAlign:"center"}} 
                                                      onClick={(e)=>handleClick(e, ele._id)}>{ele.name}
                                                      
                                                </Card>
                {!ele.members.includes(data.user._id) && <Button onClick={(e) => { handleJoin(e, data.user, ele._id) }}>Join</Button>}
                    </div>)
                })
            }
          <Card style={{ width: '15rem',height:"3rem",textAlign:"center",background:"lightblue"}} onClick={handleSingleChats}> For Single chats</Card>
                
                </Col>
                <Col className="col-md-8" style={{border:"1px solid grey" , borderRadius:"10px"}}>
              
            {groupId && <>
                {
                    groupMessages.filter((ele) => {
                        return ele.groupId === groupId
                    }).map((ele,i) => {
                        return (<p  style={{background:"coral",padding:"10px",margin:"10px",borderRadius:"10px",width:"50%"}}  key={i}>{ele.senderName} - {ele.message}</p>)
                    })
                }

            </>}
            <div>
                <Form  className='form-control'  style={{margin:"10px"}}>
                  
                        <Col sm={10}>
                            <Form.Control
                             className='form-control'
                             style={{margin:"10px"}}
                                as="textarea"
                                value={message}
                                placeholder="message"
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <Button style={{width:"20%"}}  variant="primary" type="submit" onClick={handleSend}>
                                Send
                            </Button>
                        </Col>
                    
                </Form>
            </div>
            </Col>
            </Row>
        </>
    )
}
