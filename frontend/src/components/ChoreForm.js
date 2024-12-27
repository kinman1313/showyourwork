import React, { useState } from 'react';

import axios from 'axios';



const ChoreForm = ({ fetchChores }) => {

    const [name, setName] = useState('');

    const [assignedTo, setAssignedTo] = useState('');



    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await axios.post('http://localhost:5000/api/chores', { name, assignedTo });

            setName('');

            setAssignedTo('');

            fetchChores();

        } catch (err) {

            console.log(err);

        }

    };



    return (

        <form onSubmit={handleSubmit}>

            <input

                type="text"

                placeholder="Chore name"

                value={name}

                onChange={(e) => setName(e.target.value)}

                required

            />

            <input

                type="text"

                placeholder="Assigned to"

                value={assignedTo}

                onChange={(e) => setAssignedTo(e.target.value)}

                required

            />

            <button type="submit">Add Chore</button>

        </form>

    );

};



export default ChoreForm;