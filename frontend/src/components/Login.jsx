import React, {useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Button from '@mui/material/Button';

const Login = () => {
    let [email, setEmail] = useState('')
    let [password, setPassword] = useState('')
    let navigate = useNavigate()

    let login=()=>{
        let payload = {email, password}
        axios.post('http://localhost:4001/login', payload)
        .then((e)=>{
            if(e.data.status == "success"){
                navigate(`/dashbord/${e.data.id}`)
            }
            else if(e.data.status == "fail"){
                alert("wrong password")
            }
            else if(e.data.status == "noUser"){
                alert("Invalid Email")
            }
        })
    }

    return (
        <div>
            <div className=' max-w-[900px]  h-[550px] border-4 border-black mx-auto shadow-xl scale-75 p-[30px]'>
                <h1 className='text-center font-bold text-2xl my-3'>Login Form</h1>
                <div className='border border-black max-w-[300px] h-[350px] mx-auto my-5 p-10'> 
                <input className='bg-cyan-100 border-2 border-black text-black my-3 placeholder-black ' placeholder='Email' type="text" value={email} onChange={(e)=>{setEmail(e.target.value)}} />
                <br />
                <input className='bg-cyan-100 border-2 border-black text-black my-3 placeholder-black' placeholder='Password' type="text" value={password} onChange={(e)=>{setPassword(e.target.value)}}/>
                <button className='bg-cyan-100  border-2 border-black  ml-13 rounded-lg p-2' onClick={login}>LOGIN</button>
                <br />
                <p>do not have Account? <Button variant="outlined"><Link to='/register'> Sign Up</Link></Button> </p>
                </div>
            </div>


        </div>
    )
}

export default Login