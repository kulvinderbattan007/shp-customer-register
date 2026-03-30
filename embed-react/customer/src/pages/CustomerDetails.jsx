import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";


function CustomerDetails() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);




  useEffect(() => {
    fetch(`http://localhost:3000/shopify/customers/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCustomer(data.customer);
      })
      .catch((err) => console.error(err));
  }, [id]);

  if (!customer) return <h2>Loading...</h2>;

  const name = `${customer.firstName || ""} ${customer.lastName || ""}`;
  const email = customer.defaultEmailAddress?.emailAddress;
  const phone = customer.defaultPhoneNumber?.phoneNumber;
  const address = customer.addresses?.[0];

  return (
    <div style={{ background: "#f6f6f7", minHeight: "100vh", padding: "20px" }}>

      {/* 🔹 Header */}
      <h1 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "15px" }}>
        👤 {name || email}
      </h1>

      {/* 🔹 Stats */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Card title="Amount spent" value={`₹${customer.amountSpent.amount}`} />
        <Card title="Orders" value={customer.numberOfOrders} />
        <Card title="Customer since" value={new Date(customer.createdAt).toLocaleDateString()} />
        <Card title="Status" value={customer.state} />
      </div>

      {/* 🔹 Main Layout */}
      <div style={{ display: "flex", gap: "20px" }}>

        {/* LEFT SIDE */}
        <div style={{ flex: 2 }}>

          {/* Last Order */}
          <Section title="Last order placed">
            <p>No order data yet</p>
          </Section>

          {/* Metafields */}
          <Section title="Metafields">
            <input
              type="text"
              placeholder="Enter value"
              style={{ width: "100%", padding: "8px" }}
            />
          </Section>

          {/* Timeline */}
          <Section title="Timeline">
            <textarea
              placeholder="Leave a comment..."
              style={{ width: "100%", padding: "10px" }}
            />
            <button style={{ marginTop: "10px" }}>Post</button>
          </Section>

        </div>

        {/* RIGHT SIDE */}
        <div style={{ flex: 1 }}>

          {/* Customer Info */}
          {/* <Section title="Customer">
           
          </Section> */}

          {/* Address */}
          <Section
            title="Customer"
            menuItems={[
              { label: "Edit contact information", onClick: () => alert("Edit contact") },
              { label: "Manage addresses", onClick: () => setShowAddressModal(true) },
              { label: "Edit marketing settings", onClick: () => alert("Marketing") },
              { label: "Edit tax details", onClick: () => alert("Tax") },
              { label: "Add to company", onClick: () => alert("Company") }
            ]}
          >
            <h3 style={{ marginBottom: "10px" }}>Default address</h3>
            <p><b>Email:</b> {email}</p>
            <p><b>Phone:</b> {phone || "-"}</p>
            {address ? (
              <div>
                {/* <p>{address.firstName} {address.lastName} </p>  */}
                <p>{address.address1}</p>
                <p> {address.zip} {address.city} {address.province} </p>
                <p>{address.country}</p>
              </div>
            ) : (
              <p>No address</p>
            )}
          </Section>

          {/* Tags */}
          <Section title="Tags">
            {customer.tags.length > 0
              ? customer.tags.map((tag, i) => (
                <span key={i} style={tagStyle}>{tag}</span>
              ))
              : "No tags"}
          </Section>

          {/* Notes */}
          <Section title="Notes">
            <p>{customer.note || "None"}</p>
          </Section>

        </div>
      </div>
      {showAddressModal && (
        <AddressModal
          customerId={id}
          onClose={() => setShowAddressModal(false)}
        />
      )}
    </div>


  );
}

export default CustomerDetails;





// 🔹 Reusable Card
function Card({ title, value }) {
  return (
    <div style={{
      background: "white",
      padding: "15px",
      borderRadius: "8px",
      flex: 1
    }}>
      <p style={{ fontSize: "12px", color: "gray" }}>{title}</p>
      <h3>{value}</h3>
    </div>
  );
}


// 🔹 Reusable Section
// import { useState } from "react";

function Section({ title, children, menuItems }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div style={{
      background: "white",
      padding: "15px",
      borderRadius: "8px",
      marginBottom: "15px",
      position: "relative"
    }}>

      {/* 🔹 Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ marginBottom: "10px" }}>{title}</h3>

        {/* 🔹 3 dots */}
        {menuItems && (
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              border: "none",
              background: "#eee",
              borderRadius: "6px",
              padding: "5px 10px",
              cursor: "pointer"
            }}
          >
            ⋯
          </button>
        )}
      </div>

      {/* 🔻 Dropdown */}
      {showMenu && (
        <div style={{
          position: "absolute",
          right: "10px",
          top: "40px",
          background: "red",
          border: "1px solid #ddd",
          borderRadius: "6px",
          width: "200px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          {menuItems.map((item, i) => (
            <div
              key={i}
              onClick={() => {
                item.onClick();
                setShowMenu(false);
              }}
              style={{
                padding: "10px",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => e.target.style.background = "#f5f5f5"}
              onMouseLeave={(e) => e.target.style.background = "white"}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {children}
    </div>
  );


}


// 🔹 Tag Style
const tagStyle = {
  background: "#e0e0e0",
  padding: "5px 10px",
  borderRadius: "20px",
  marginRight: "5px",
  fontSize: "12px"
};

function Editmodal({ id, onClose }) {
alert(id);
}

function AddressModal({ customerId, onClose }) {
  const menuItems = [
    { label: "edit address", onClick: (addr) => {
    setSelectedAddress(addr);
    setFormData({
      country: addr.country || "India",
      firstName: addr.first_name || "",
      lastName: addr.last_name || "",
      company: addr.company || "",
      address1: addr.address1 || "",
      address2: addr.address2 || "",
      city: addr.city || "",
      state: addr.province || "",
      zip: addr.zip || "",
      phone: addr.phone || "",
    });
  } },
    { label: "Set as default", onClick: (id) => alert(id+' '+"Set as default") },
    { label: "Delete", onClick: (id) => alert(id+' '+"Delete") }];

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const { id } = useParams();

    const [selectedAddress, setSelectedAddress] = useState(null);
const [formData, setFormData] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/shopify/customers/${customerId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched addresses:", data);
        const custid = (data.customer.id || []);

        setAddresses(data.customer?.addresses || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [customerId]);

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>Customer Addresses</h2>
          <button onClick={onClose} style={modalStyles.closeBtn}>✕</button>
        </div>

        {/* Content */}
        {loading ? (
          <p>Loading...{customerId}</p>
        ) : addresses.length === 0 ? (
          <p>No addresses found</p>
        ) : (
          addresses.map((addr, i) => (
            <div key={i} style={modalStyles.card} 
            
           
            >


              <button
               onClick={() => setActiveMenu(activeMenu === i ? null : i)}
                style={{
                  border: "none",
                  background: "#eee",
                  borderRadius: "6px",
                  padding: "5px 10px",
                  cursor: "pointer"
                }}
              >
                ⋯
              </button>
              {/* 🔻 Dropdown */}
                 {activeMenu === i && (
        <div style={{
          position: "relative",
          right: "10px",
          // top: "40px",
          background: "blue",
          border: "1px solid #ddd",
          borderRadius: "6px",
          width: "200px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          {menuItems.map((item, i) => (
            <div
              key={i}
              onClick={() => {
                item.onClick(addr);
                setShowMenu(false);
              }}
              style={{
                padding: "10px",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => e.target.style.background = "#f5f5f5"}
              onMouseLeave={(e) => e.target.style.background = "white"}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}

              <p><b>{addr.first_name} {addr.last_name}</b></p>
              <p>{addr.address1}</p>
              <p>{addr.city}, {addr.province}</p>
              <p>{addr.country} - {addr.zip}</p>
              <p>{addr.phone || "-"}</p>
            </div>
          ))
        )}
      </div>

      {selectedAddress && (
  <div style={styles.overlay}>
    <div style={styles.modal}>

      {/* Header */}
      <div style={styles.header}>
        <h2>Edit shipping address</h2>
        <button onClick={() => setSelectedAddress(null)}>✕</button>
      </div>

      {/* Form */}
      <div style={styles.form}>
        
        <label>Country/region</label>
        <select name="country" value={formData.country} onChange={handleChange}>
          <option>India</option>
          <option>United States</option>
        </select>

        <div style={styles.row}>
          <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" />
          <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" />
        </div>

        <input name="company" value={formData.company} onChange={handleChange} placeholder="Company" />
        <input name="address1" value={formData.address1} onChange={handleChange} placeholder="Address" />
        <input name="address2" value={formData.address2} onChange={handleChange} placeholder="Apartment, suite..." />

        <div style={styles.row}>
          <input name="city" value={formData.city} onChange={handleChange} placeholder="City" />
          <input name="state" value={formData.state} onChange={handleChange} placeholder="State" />
          <input name="zip" value={formData.zip} onChange={handleChange} placeholder="PIN code" />
        </div>

        <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" />

      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <button onClick={() => setSelectedAddress(null)}>Cancel</button>
        <button
          onClick={() => {
            console.log("Updated:", formData);
            setSelectedAddress(null);
          }}
        >
          Save
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "#fff",
    width: "600px",
    borderRadius: "12px",
    padding: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  row: {
    display: "flex",
    gap: "10px",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },
};
const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999
  },
  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "450px",
    maxHeight: "80vh",
    overflowY: "auto"
  },
  card: {
    border: "1px solid #ddd",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "10px"
  },
  closeBtn: {
    border: "none",
    background: "transparent",
    fontSize: "18px",
    cursor: "pointer"
  }
};