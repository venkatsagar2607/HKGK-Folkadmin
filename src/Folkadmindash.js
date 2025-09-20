import React, { useState, useEffect } from 'react';
import './Folkadmindash.css';
import { useNavigate } from 'react-router-dom';
import { FaEdit } from 'react-icons/fa';

const BedAssignmentModal = ({ showModal, selectedUser, beds, onClose, onAssign }) => {
  if (!showModal || !selectedUser) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{selectedUser.assigned_bed ? "Edit Bed Assignment" : "Assign Bed"} for {selectedUser.name}</h3>
        <p>Select an available bed:</p>
        {beds.length > 0 ? (
          <ul className="modal-list">
            {beds.map(bed => (
              <li key={bed.bedId}>
                <span>Bed No: {bed.bedId}</span>
                {
                  bed.status === 'available' || bed.bedId === selectedUser.assigned_bed ?
                    <button
                      onClick={() => onAssign(bed.bedId)}
                      className="modal-assign-button"
                    >
                      {bed.bedId === selectedUser.assigned_bed ? "Reassign" : "Assign"}
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
  const [phoneNumber, setPhoneNumber] = useState(0);
  const nav = useNavigate();

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn !== 'true') {
      nav("/");
    }
  }, [nav]);

  const getApproved = async () => {
    await fetch('https://hkgk-temple-server.onrender.com/approved-users')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsers(data.users);
        }
      })
      .catch(() => {
        alert("Server Problem");
      });
  };

  const getBeds = async () => {
    await fetch('https://hkgk-temple-server.onrender.com/get-beds')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBeds(data.beds);
        }
      })
      .catch(() => {
        alert("Server Problem");
      });
  };

  // Fetch approved users and beds on mount
  useEffect(() => {
    getApproved();
    getBeds();
  }, []);

  const handleAssignClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleBedAssignment = async (bedId) => {
    if (!selectedUser) return;
    const response = await fetch('https://hkgk-temple-server.onrender.com/assign-bed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bedId: bedId, userId: selectedUser._id }),
    });

    const data = await response.json();
    console.log(data)
    if (data.success) {
      console.log("Hello World")
      getApproved();
      getBeds();
      setShowModal(false);
    }
    console.log("5678765")
  };

  const removeUser = async (userId, bedId) => {
    const response = await fetch('https://hkgk-temple-server.onrender.com/remove-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bedId: bedId, userId: userId }),
    });

    const data = await response.json();
    if (data.success) {
      getApproved();
      getBeds();
    }
  };

  const getRecords = async () => {
    setUsers((prevUsers) => {
      if (!phoneNumber || phoneNumber === 0) {
        return prevUsers;
      }
      return prevUsers.filter(user => String(user.phoneNumber).includes(String(phoneNumber)));
    });
  };

  return (
    <div className="admin-dashboard-container">
      <div className="main-card">
        <h1 className="title">Folk Admin - Bed Assignment</h1>

        <div className="search-container">
          <input
            type="number"
            placeholder="Search by phone number..."
            value={phoneNumber === 0 ? '' : phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            style={{
              padding: '8px 12px',
              fontSize: '16px',
              width: '40%',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
          <button type="button" onClick={getRecords} className="submit-btn">Submit</button>
        </div>

        {/* Table for larger screens */}
        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Folk Guide</th>
                <th>Phone Number</th>
                <th>Email</th>
                <th>Dates</th>
                <th>CheckinTime</th>
                <th>CheckoutTime</th>
                <th>Status</th>
                <th>Assigned Bed No.</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td className="text-gray-500">{user.folkGuidName}</td>
                  <td>{user.phoneNumber}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.fromDate).toDateString()} to {new Date(user.toDate).toDateString()}</td>
                  <td>{user.checkinTime}</td>
                  <td>{user.checkoutTime}</td>
                  <td>
                    <span className={`status-badge ${user.status === 'approved' ? 'status-approved' : 'status-assigned'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    {user.assigned_bed || 'N/A'}{" "}
                    {user.assigned_bed &&
                      <FaEdit
                        onClick={() => handleAssignClick(user)}
                        style={{ cursor: 'pointer', marginLeft: '8px', color: '#007bff' }}
                        title="Edit Bed"
                      />}
                  </td>
                  <td>
                    {user.assigned_bed == null ? (
                      <button
                        onClick={() => handleAssignClick(user)}
                        className="assign-button"
                      >
                        Assign Bed
                      </button>
                    ) : (
                      <button
                        className="de-button"
                        onClick={() => removeUser(user._id, user.assigned_bed)}
                      >
                        Exit&nbsp;User
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards for small screens */}
        <div className="mobile-card-container">
          {users.map(user => (
            <div key={user._id} className="user-card">
              <div className="card-header">
                <h3>{user.name}</h3>
                <span className={`status-badge ${user.status === 'approved' ? 'status-approved' : 'status-assigned'}`}>
                  {user.status}
                </span>
              </div>
              <p>Folk Guide: {user.folkGuidName}</p>
              <p>Mobile: {user.phoneNumber}</p>
              <p>Dates: {new Date(user.fromDate).toDateString()} to {new Date(user.toDate).toDateString()}</p>
              <p>CheckinTime: {user.checkinTime}</p>
              <p>CheckoutTime: {user.checkoutTime}</p>
              <p className="assigned-bed">
                Assigned Bed No.: {user.assigned_bed || 'N/A'}{" "}
                {user.assigned_bed &&
                  <FaEdit
                    onClick={() => handleAssignClick(user)}
                    style={{ cursor: 'pointer', marginLeft: '6px', color: '#007bff' }}
                    title="Edit Bed"
                  />}
              </p>
              {user.assigned_bed == null ? (
                <button
                  onClick={() => handleAssignClick(user)}
                  disabled={user.status !== 'approved'}
                  className="assign-button full-width-button"
                >
                  Assign Bed
                </button>
              ) : (
                <button
                  className="de-button full-width-button"
                  onClick={() => removeUser(user._id, user.assigned_bed)}
                >
                  Exit&nbsp;User
                </button>
              )}
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
