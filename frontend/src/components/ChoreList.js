import React from 'react';

import axios from 'axios';



const ChoreList = ({ chores, fetchChores }) => {

    const handleToggleComplete = async (id, completed) => {

        try {

            await axios.put(`http://localhost:5000/api/chores/${id}`, { completed: !completed });

            fetchChores();

        } catch (err) {

            console.log(err);

        }

    };



    const handleDelete = async (id) => {

        try {

            await axios.delete(`http://localhost:5000/api/chores/${id}`);

            fetchChores();

        } catch (err) {

            console.log(err);

        }

    };



    return (

        <ul>

            {chores.map((chore) => (

                <li key={chore._id}>

                    <span style={{ textDecoration: chore.completed ? 'line-through' : 'none' }}>

                        {chore.name} (Assigned to: {chore.assignedTo})

                    </span>

                    <button onClick={() => handleToggleComplete(chore._id, chore.completed)}>

                        {chore.completed ? 'Mark Incomplete' : 'Mark Complete'}

                    </button>

                    <button onClick={() => handleDelete(chore._id)}>Delete</button>

                </li>

            ))}

        </ul>

    );

};



export default ChoreList;