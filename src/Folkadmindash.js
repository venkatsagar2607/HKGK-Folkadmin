import React, { useState, useEffect } from 'react';
import './Folkadmindash.css';

const BedAssignmentModal = ({ showModal, selectedUser, beds, onClose, onAssign }) => {
  if (!showModal || !selectedUser) return null;

  // const availableBeds = beds.filter(bed => bed.status === 'available');

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Assign Bed to {selectedUser.name}</h3>
        <p>Select an available bed:</p>
        {beds.length > 0 ? (
          <ul className="modal-list">
            {beds.map(bed => (
              <li key={bed.bedId}>
                <span>Bed No: {bed.bedId}</span>
                {
                  bed.status === 'available' ?
                    <button
                      onClick={() => onAssign(bed.bedId)}
                      className="modal-assign-button"
                    >
                      Assign
                    </button> :
                    <p>Allocated</p>
                }
              </li>
            ))}
          </ul>
        ) : (
          <p>No beds are currently available.</p>
        )}
        <button
          onClick={onClose}
          className="modal-cancel-button"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};


const App = () => {
  const [users, setUsers] = useState([]);
  const [beds, setBeds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const getApproved = async () => {
    await fetch('http://localhost:3001/approved-users')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsers(data.users);
          console.log(data.users)
        }
      })
      .catch(() => {
        // Fallback or handle error, optionally load mock data
        alert("Server Problem");
      });
  }

  const getBeds = async () => {
    await fetch('http://localhost:3001/get-beds')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBeds(data.beds);
          console.log(data.beds)
        }
      })
      .catch(() => {
        // Fallback or handle error, optionally load mock data
        alert("Server Problem");
      });
  }

  // Fetch approved users and beds on mount
  useEffect(() => {
    // Fetch approved users from backend
    getApproved();
    getBeds();

  }, []);

  const handleAssignClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleBedAssignment = async (bedId) => {
    console.log(selectedUser)
    if (!selectedUser)
      return;
    const response = await fetch('http://localhost:3001/assign-bed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bedId: bedId, userId: selectedUser.id }),
    });

    const data = await response.json();
    if (data.success) {
      getApproved();
      getBeds();
      setShowModal(false);

    }
  };

  const removeUser = async (userId, bedId) => {
    const response = await fetch('http://localhost:3001/remove-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bedId: bedId, userId: userId }),
    });

    const data = await response.json();
    console.log(response);
    if (data.success) {
      getApproved();
      getBeds();
    }
  }

  return (
    <div className="admin-dashboard-container">
      <div className="main-card">
        <h1 className="title">Folk Admin - Bed Assignment</h1>

        {/* Table for larger screens */}
        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Folk Guide</th>
                <th>Status</th>
                <th>Assigned Bed No.</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td className="text-gray-500">{user.folkGuidName}</td>
                  <td>
                    <span className={`status-badge ${user.status === 'approved' ? 'status-approved' : 'status-assigned'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.assigned_bed || 'N/A'}</td>
                  <td>
                    {user.assigned_bed == null ? <button
                      onClick={() => handleAssignClick(user)}
                      className="assign-button"
                    >
                      Assign Bed
                    </button> :
                      <button
                        className="de-button"
                        onClick={() => {
                          removeUser(user.id, user.assigned_bed)
                        }}
                      >
                        Exit&nbsp;User

                      </button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards for small screens */}
        <div className="mobile-card-container">
          {users.map(user => (
            <div key={user.id} className="user-card">
              <div className="card-header">
                <h3>{user.name}</h3>
                <span className={`status-badge ${user.status === 'approved' ? 'status-approved' : 'status-assigned'}`}>
                  {user.status}
                </span>
              </div>
              <p>Request: {user.folkGuidName}</p>
              <p className="assigned-bed">Assigned Bed No.: {user.assignedBedId || 'N/A'}</p>
              <button
                onClick={() => handleAssignClick(user)}
                disabled={user.status !== 'approved'}
                className="assign-button full-width-button"
              >
                Assign Bed
              </button>
            </div>
          ))}
        </div>
      </div>
      <BedAssignmentModal
        showModal={showModal}
        selectedUser={selectedUser}
        beds={beds}
        onClose={() => {
          setShowModal(false);
          setSelectedUser(null);
        }}
        onAssign={handleBedAssignment}
      />
    </div>
  );
};

export default App;
