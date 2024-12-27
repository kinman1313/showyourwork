import React, { useState, useEffect } from 'react';

import axios from 'axios';



const AdminPage = () => {

    const [users, setUsers] = useState([]);

    const [chores, setChores] = useState([]);

    const [newUser, setNewUser] = useState({ username: '', password: '' });

    const [newChore, setNewChore] = useState({ name: '', assignedTo: '' });



    const fetchUsers = async () => {

        try {

            const response = await axios.get('http://localhost:5000/api/admin/users');

            setUsers(response.data);

        } catch (err) {

            console.log(err);

        }

    };



    const fetchChores = async () => {

        try {

            const response = await axios.get('http://localhost:5000/api/chores');

            setChores(response.data);

        } catch (err) {

            console.log(err);

        }

    };



    const handleRegisterUser = async (e) => {

        e.preventDefault();

        try {

            await axios.post('http://localhost:5000/api/admin/register-user', newUser);

            setNewUser({ username: '', password: '' });

            fetchUsers();

        } catch (err) {

            console.log(err);

        }

    };



    const handleCreateChore = async (e) => {

        e.preventDefault();

        try {

            await axios.post('http://localhost:5000/api/admin/create-chore', newChore);

            setNewChore({ name: '', assignedTo: '' });

            fetchChores();

        } catch (err) {

            console.log(err);

        }

    };



    useEffect(() => {

        fetchUsers();

        fetchChores();

    }, []);



    return (

        <div className="admin-page">

            <h2>Admin Dashboard</h2>



            <div className="admin-section">

                <h3>Register New User</h3>

                <form onSubmit={handleRegisterUser}>

                    <input

                        type="text"

                        placeholder="Username"

                        value={newUser.username}

                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}

                        required

                    />

                    <input

                        type="password"

                        placeholder="Password"

                        value={newUser.password}

                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}

                        required

                    />

                    <button type="submit">Register User</button>

                </form>

            </div>



            <div className="admin-section">

                <h3>Create New Chore</h3>

                <form onSubmit={handleCreateChore}>

                    <input

                        type="text"

                        placeholder="Chore name"

                        value={newChore.name}

                        onChange={(e) => setNewChore({ ...newChore, name: e.target.value })}

                        required

                    />

                    <select

                        value={newChore.assignedTo}

                        onChange={(e) => setNewChore({ ...newChore, assignedTo: e.target.value })}

                        required

                    >

                        <option value="">Assign to</option>

                        {users.map((user) => (

                            <option key={user._id} value={user._id}>

                                {user.username}

                            </option>

                        ))}

                    </select>

                    <button type="submit">Create Chore</button>

                </form>

            </div>



            <div className="admin-section">

                <h3>Chores</h3>

                <ul>

                    {chores.map((chore) => (

                        <li key={chore._id}>

                            <span>{chore.name} (Assigned to: {chore.assignedTo})</span>

                        </li>

                    ))}

                </ul>

            </div>

        </div>

    );

};



export default AdminPage;
