import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/shopify/customers")
      .then((res) => res.json())
      .then((data) => {
        const customerData = data?.data?.customers?.nodes || [];
        setCustomers(customerData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: "20px", background: "#f6f6f7", minHeight: "100vh" }}>
      
      {/* 🔹 Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
        <h1>Customers</h1>
        <div>
          <button>Export</button>
          <button style={{ marginLeft: "10px" }}>Import</button>
          <button style={{ marginLeft: "10px", background: "black", color: "white" }}>
            Add customer
          </button>
        </div>
      </div>

      {/* 🔹 Stats */}
      <div style={{ background: "white", padding: "15px", borderRadius: "8px", marginBottom: "15px" }}>
        <b>{customers.length} customers</b>
        <span style={{ marginLeft: "15px", color: "gray" }}>
          100% of your customer base
        </span>
      </div>

      {/* 🔹 Search */}
      <div style={{ background: "white", padding: "15px", borderRadius: "8px", marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Search customers"
          style={{ width: "100%", padding: "8px" }}
        />
      </div>

      {/* 🔹 Table */}
      <div style={{ background: "white", borderRadius: "8px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f1f1f1" }}>
            <tr>
              <th style={{ padding: "10px", textAlign: "left" }}>Customer name</th>
              <th>Email subscription</th>
              <th>Location</th>
              <th>Orders</th>
              <th>Amount spent</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((cust) => {
              const id = cust.id.split("/").pop(); // ⭐ IMPORTANT
              const name = `${cust.firstName || ""} ${cust.lastName || ""}`.trim();
              const email = cust.defaultEmailAddress?.emailAddress;
              const subs_status = cust.defaultEmailAddress?.marketingState;

              const location = cust.defaultAddress
                ? `${cust.defaultAddress.city}, ${cust.defaultAddress.country}`
                : "-";

              const statusText =
                subs_status === "NOT_SUBSCRIBED"
                  ? "Not subscribed"
                  : "Subscribed";

              return (
                <tr
                  key={cust.id}
                  onClick={() => navigate(`/customers/${id}`)} // 🚀 clickable row
                  style={{
                    borderTop: "1px solid #eee",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f9f9f9")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "white")
                  }
                >
                  <td style={{ padding: "10px", fontWeight: "500" }}>
                    {name || email || "No Name"}
                  </td>

                  <td>
                    <span
                      style={{
                        background: "#e0e0e0",
                        padding: "5px 10px",
                        borderRadius: "20px",
                        fontSize: "12px"
                      }}
                    >
                      {statusText}
                    </span>
                  </td>

                  <td>{location}</td>

                  <td>{cust.numberOfOrders} orders</td>

                  <td>₹ {cust.amountSpent.amount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Customers;