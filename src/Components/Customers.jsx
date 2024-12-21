import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.css";

const Customers = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editedClient, setEditedClient] = useState(null);
  const API_URL = "https://law-office.al-mosa.com/api/customers";
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire("خطأ", "يجب تسجيل الدخول أولاً", "error");
      navigate("/login");
      return;
    }

    const fetchClients = async () => {
      Swal.fire({
        title: "جاري تحميل بيانات الموكلين",
        text: "الرجاء الانتظار...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      try {
        const response = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setClients(response.data);
        Swal.close();
      } catch (error) {
        Swal.fire(
          "خطأ",
          error.response?.data?.message || "حدث خطأ أثناء جلب البيانات",
          "error"
        );
      }
    };

    fetchClients();
  }, [navigate]);

  const handleViewDetails = async (client) => {
    Swal.fire({
      title: "جاري تحميل بيانات الموكل",
      text: "الرجاء الانتظار...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    setTimeout(() => {
      setSelectedClient(client);
      setShowModal(true);
      Swal.close();
    }, 500);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowEditModal(false);
  };

  const handleOpenEditModal = (client) => {
    setSelectedClient(client);
    setEditedClient({ ...client });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedClient((prevClient) => ({
      ...prevClient,
      [name]: value,
    }));
  };

  const handleUpdateClient = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("خطأ", "يجب تسجيل الدخول أولاً", "error");
      navigate("/login");
      return;
    }
    Swal.fire({
      title: "جاري تعديل بيانات الموكل",
      text: "الرجاء الانتظار...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const updatedClientData = {};

      if (editedClient.name !== selectedClient.name) {
        updatedClientData.name = String(editedClient.name);
      }
      if (editedClient.email !== selectedClient.email) {
        updatedClientData.email = String(editedClient.email);
      }
      if (editedClient.ID_number !== selectedClient.ID_number) {
        updatedClientData.ID_number = String(editedClient.ID_number);
      }
      if (editedClient.phone !== selectedClient.phone) {
        updatedClientData.phone = String(editedClient.phone);
      }
      if (editedClient.address !== selectedClient.address) {
        updatedClientData.address = String(editedClient.address);
      }
      if (editedClient.nationality !== selectedClient.nationality) {
        updatedClientData.nationality = String(editedClient.nationality);
      }
      if (editedClient.company_name !== selectedClient.company_name) {
        updatedClientData.company_name = String(editedClient.company_name);
      }
      if (editedClient.notes !== selectedClient.notes) {
        updatedClientData.notes = String(editedClient.notes);
      }
      console.log("Data being sent:", updatedClientData);

      const response = await axios.post(
        `https://law-office.al-mosa.com/api/update-customer/${editedClient.id}`,
        updatedClientData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        Swal.fire({
          title: "تم التعديل!",
          text: "تم تعديل بيانات الموكل بنجاح.",
          icon: "success",
          confirmButtonText: "حسناً",
        }).then(() => {
          setTimeout(() => {
            setClients((prevClients) =>
              prevClients.map((item) =>
                item.id === editedClient.id ? { ...editedClient } : item
              )
            );
            setShowEditModal(false);
          }, 500);
        });
      } else {
        console.error("Error response:", response);
        Swal.fire({
          title: "خطأ!",
          text: response.data?.message || "حدث خطأ أثناء تعديل بيانات الموكل",
          icon: "error",
          confirmButtonText: "حسناً",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      console.error("Error response data:", error.response?.data);
      Swal.fire({
        title: "خطأ!",
        text:
          error.response?.data?.message || "حدث خطأ أثناء تعديل بيانات الموكل",
        icon: "error",
        confirmButtonText: "حسناً",
      });
    } finally {
      Swal.close();
    }
  };

  const handleEdit = (client) => {
    Swal.fire({
      title: "تعديل اسم الموكل",
      html: `
        <input id="name" class="swal2-input" placeholder="الاسم الجديد" value="${client.name}">
      `,
      focusConfirm: false,
      preConfirm: () => {
        const updatedName = document.getElementById("name").value;

        if (!updatedName.trim()) {
          Swal.fire("خطأ", "يجب إدخال اسم جديد", "error");
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire("خطأ", "يجب تسجيل الدخول أولاً", "error");
          navigate("/login");
          return;
        }

        axios
          .post(
            `https://law-office.al-mosa.com/api/update-customer/${client.id}`,
            { name: updatedName },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then((response) => {
            Swal.fire("تم التعديل!", "تم تعديل اسم الموكل بنجاح.", "success");
            setClients((prevClients) =>
              prevClients.map((item) =>
                item.id === client.id ? { ...item, name: updatedName } : item
              )
            );
          })
          .catch(() => {
            Swal.fire("خطأ", "حدث خطأ أثناء تعديل اسم الموكل", "error");
          });
      },
    });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، حذف!",
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire("خطأ", "يجب تسجيل الدخول أولاً", "error");
          navigate("/login");
          return;
        }

        axios
          .delete(`https://law-office.al-mosa.com/api/customer/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then(() => {
            Swal.fire("تم الحذف!", "تم حذف الموكل بنجاح.", "success");
            setClients((prevClients) =>
              prevClients.filter((client) => client.id !== id)
            );
          })
          .catch(() => {
            Swal.fire("خطأ", "حدث خطأ أثناء حذف الموكل", "error");
          });
      }
    });
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="text-center" style={{ backgroundColor: "#f0f0f0" }}>
      <>
        <div className="container">
          <div className="row p-0 align-items-center">
            <div className="col-12 col-md-6 my-3 d-flex justify-content-center justify-content-md-start">
              <input
                type="text"
                className="form-control w-75 w-md-50"
                placeholder="ابحث عن موكل بالاسم"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  borderWidth: "2px",
                  borderColor: "#64b5f6",
                  boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
                  fontSize: "1rem",
                  padding: "10px",
                  transition: "border-color 0.3s ease",
                }}
              />
            </div>
            <div className="col-12 col-md-6 my-3 text-center text-md-end">
              <h1
                className="py-2 py-md-4 fs-2 fw-bold"
                style={{ color: "#1a237e" }}
              >
                قائمة الموكلين
              </h1>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 flex-row-reverse">
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <div className="col my-3" key={client.id}>
                  <div
                    className="card h-100 case-card"
                    dir="rtl"
                    style={{ backgroundColor: "#fff" }}
                  >
                    <div
                      className="card-header case-card-header text-white d-flex justify-content-between align-items-center"
                      style={{ backgroundColor: "#1a237e" }}
                    >
                      <h5 className="card-title m-0 text-start flex-grow-1 ps-2 w-100 text-end">
                        {client.name}
                      </h5>
                      <i className="fas fa-user fs-4 me-2"></i>
                    </div>
                    <div className="card-body">
                      <div className="d-flex flex-column gap-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <span
                            className="text-bold me-2"
                            style={{ fontSize: "1.1rem", color: "#343a40" }}
                          >
                            <i className="fas fa-phone ms-2"></i>
                            رقم الهاتف:
                          </span>
                          <span
                            className="text-start"
                            style={{ fontSize: "1rem", color: "#343a40" }}
                          >
                            {client.phone}
                          </span>
                        </div>
                        <hr className="my-2" style={{ margin: "5px 0" }} />
                        <div className="d-flex justify-content-between align-items-center">
                          <span
                            className="text-bold me-2"
                            style={{ fontSize: "1.1rem", color: "#343a40" }}
                          >
                            <i className="fas fa-globe ms-2"></i>
                            الجنسية:
                          </span>
                          <span
                            className="text-start"
                            style={{ fontSize: "1rem", color: "#343a40" }}
                          >
                            {client.nationality}
                          </span>
                        </div>
                        <hr className="my-2" style={{ margin: "5px 0" }} />
                        <div className="d-flex justify-content-between align-items-center">
                          <span
                            className="text-bold me-2"
                            style={{ fontSize: "1.1rem", color: "#343a40" }}
                          >
                            <i className="fas fa-map-marker-alt ms-2"></i>
                            العنوان:
                          </span>
                          <span
                            className="text-start"
                            style={{ fontSize: "1rem", color: "#343a40" }}
                          >
                            {client.address}
                          </span>
                        </div>
                        <hr className="my-2" style={{ margin: "5px 0" }} />
                      </div>
                      <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
                        <button
                          className="btn btn-info btn-sm case-button"
                          onClick={() => handleViewDetails(client)}
                          style={{ backgroundColor: "#0dcaf0", color: "#fff" }}
                        >
                          <i className="fa fa-info-circle ms-1"></i> تفاصيل
                        </button>
                        <button
                          className="btn btn-primary btn-sm case-button"
                          onClick={() => handleOpenEditModal(client)}
                          style={{ backgroundColor: "#0d6efd", color: "#fff" }}
                        >
                          <i className="fa fa-edit ms-1"></i> تعديل
                        </button>
                        <button
                          className="btn btn-danger btn-sm case-button"
                          onClick={() => handleDelete(client.id)}
                          style={{ backgroundColor: "#dc3545", color: "#fff" }}
                        >
                          <i className="fa fa-trash-alt ms-1"></i> حذف
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col d-flex justify-content-center align-items-center">
                <p
                  className="text-center fs-3 fw-bold"
                  style={{ color: "#000" }}
                >
                  لا توجد موكلين.
                </p>
              </div>
            )}
          </div>
          <div className="container">
            <div className="row text-center">
              <div className="col-12 col-md-6 my-3">
                <Link
                  to="/AddCustomer"
                  className="btn btn-dark px-5 py-2"
                  style={{ backgroundColor: "#1a237e", color: "#fff" }}
                >
                  <i className="fa fa-plus me-2"></i> إضافة موكل جديد
                </Link>
              </div>
              <div className="col-12 col-md-6 my-3">
                <Link
                  to="/customer-categories"
                  className="btn btn-dark px-5 py-2"
                  style={{ backgroundColor: "#1a237e", color: "#fff" }}
                >
                  <i className="fa fa-list me-2"></i> إضافة نوع موكل جديد
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`modal fade ${showModal ? "show" : ""}`}
          tabIndex="-1"
          aria-labelledby="clientDetailsModal"
          aria-hidden={!showModal}
          style={{ display: showModal ? "block" : "none" }}
        >
          <div className="modal-dialog modal-lg">
            <div
              className="modal-content"
              style={{
                borderWidth: "3px",
                borderColor: "#1a237e",
                boxShadow: "0 0 15px rgba(0, 0, 0, 0.2)",
              }}
            >
              <div
                className="modal-header text-white"
                style={{ padding: "15px", backgroundColor: "#1a237e" }}
              >
                <h5
                  className="modal-title w-100 text-end"
                  style={{ fontSize: "1.4rem" }}
                >
                  بيانات الموكل
                </h5>
              </div>
              <div className="modal-body" dir="rtl" style={{ padding: "20px" }}>
                {selectedClient && (
                  <table
                    className="table table-hover table-bordered"
                    style={{ fontSize: "1.1rem", borderCollapse: "collapse" }}
                  >
                    <tbody>
                      <tr style={{ lineHeight: "2.2rem" }}>
                        <th
                          className="text-end"
                          style={{
                            backgroundColor: "#f8f9fa",
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          اسم الموكل:
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          {selectedClient.name}
                        </td>
                      </tr>
                      <tr style={{ lineHeight: "2.2rem" }}>
                        <th
                          className="text-end"
                          style={{
                            backgroundColor: "#f8f9fa",
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          البريد الإلكتروني للموكل:
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          {selectedClient.email}
                        </td>
                      </tr>
                      <tr style={{ lineHeight: "2.2rem" }}>
                        <th
                          className="text-end"
                          style={{
                            backgroundColor: "#f8f9fa",
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          رقم الهوية/السجل التجاري للموكل:
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          {selectedClient.ID_number}
                        </td>
                      </tr>
                      <tr style={{ lineHeight: "2.2rem" }}>
                        <th
                          className="text-end"
                          style={{
                            backgroundColor: "#f8f9fa",
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          رقم هاتف الموكل:
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          {selectedClient.phone}
                        </td>
                      </tr>
                      <tr style={{ lineHeight: "2.2rem" }}>
                        <th
                          className="text-end"
                          style={{
                            backgroundColor: "#f8f9fa",
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          عنوان الموكل:
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          {selectedClient.address}
                        </td>
                      </tr>
                      <tr style={{ lineHeight: "2.2rem" }}>
                        <th
                          className="text-end"
                          style={{
                            backgroundColor: "#f8f9fa",
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          جنسية الموكل:
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          {selectedClient.nationality}
                        </td>
                      </tr>
                      <tr style={{ lineHeight: "2.2rem" }}>
                        <th
                          className="text-end"
                          style={{
                            backgroundColor: "#f8f9fa",
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          اسم الشركة (إن وجد):
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          {selectedClient.company_name}
                        </td>
                      </tr>
                      <tr style={{ lineHeight: "2.2rem" }}>
                        <th
                          className="text-end"
                          style={{
                            backgroundColor: "#f8f9fa",
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          ملاحظات إضافية:
                        </th>
                        <td
                          className="text-end"
                          style={{
                            wordWrap: "break-word",
                            whiteSpace: "normal",
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          {selectedClient.notes}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
              <div className="modal-footer" style={{ padding: "15px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  style={{ fontSize: "1.1rem" }}
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`modal fade ${showEditModal ? "show" : ""}`}
          tabIndex="-1"
          aria-labelledby="editClientModal"
          aria-hidden={!showEditModal}
          style={{ display: showEditModal ? "block" : "none" }}
        >
          <div className="modal-dialog modal-lg">
            <div
              className="modal-content"
              style={{
                borderWidth: "3px",
                borderColor: "#1a237e",
                boxShadow: "0 0 15px rgba(0, 0, 0, 0.2)",
              }}
            >
              <div
                className="modal-header text-white"
                style={{ padding: "15px", backgroundColor: "#1a237e" }}
              >
                <h5
                  className="modal-title w-100 text-end"
                  style={{ fontSize: "1.4rem" }}
                >
                  تعديل بيانات الموكل
                </h5>
              </div>
              <div className="modal-body" dir="rtl" style={{ padding: "20px" }}>
                {editedClient && (
                  <table
                    className="table table-hover table-bordered"
                    style={{ fontSize: "1.1rem", borderCollapse: "collapse" }}
                  >
                    <tbody>
                      <tr style={{ lineHeight: "2.2rem" }}>
                        <th
                          className="text-end"
                          style={{
                            backgroundColor: "#f8f9fa",
                            padding: "10px",
                            border: "2px solid #6c757d",
                            width: "25%",
                          }}
                        >
                          اسم الموكل:
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          <input
                            type="text"
                            className="form-control text-end"
                            name="name"
                            value={editedClient.name || ""}
                            onChange={handleEditInputChange}
                            style={{
                              fontSize: "1rem",
                              padding: "10px",
                              border: "1px solid #6c757d",
                            }}
                          />
                        </td>
                      </tr>
                      <tr style={{ lineHeight: "2.2rem" }}>
                        <th
                          className="text-end"
                          style={{
                            backgroundColor: "#f8f9fa",
                            padding: "10px",
                            border: "2px solid #6c757d",
                            width: "25%",
                          }}
                        >
                          البريد الإلكتروني للموكل:
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          <input
                            type="email"
                            className="form-control text-end"
                            name="email"
                            value={editedClient.email || ""}
                            onChange={handleEditInputChange}
                            style={{
                              fontSize: "1rem",
                              padding: "10px",
                              border: "1px solid #6c757d",
                            }}
                          />
                        </td>
                      </tr>
                      <tr style={{ lineHeight: "2.2rem" }}>
                        <th
                          className="text-end"
                          style={{
                            backgroundColor: "#f8f9fa",
                            padding: "10px",
                            border: "2px solid #6c757d",
                            width: "25%",
                          }}
                        >
                          رقم الهوية/السجل التجاري للموكل:
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          <input
                            type="text"
                            className="form-control text-end"
                            name="ID_number"
                            value={editedClient.ID_number || ""}
                            onChange={handleEditInputChange}
                            style={{
                              fontSize: "1rem",
                              padding: "10px",
                              border: "1px solid #6c757d",
                            }}
                          />
                        </td>
                      </tr>
                      <tr style={{ lineHeight: "2.2rem" }}>
                        <th
                          className="text-end"
                          style={{
                            backgroundColor: "#f8f9fa",
                            padding: "10px",
                            border: "2px solid #6c757d",
                            width: "25%",
                          }}
                        >
                          رقم هاتف الموكل:
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          <input
                            type="text"
                            className="form-control text-end"
                            name="phone"
                            value={editedClient.phone || ""}
                            onChange={handleEditInputChange}
                            style={{
                              fontSize: "1rem",
                              padding: "10px",
                              border: "1px solid #6c757d",
                            }}
                          />
                        </td>
                      </tr>
                      <tr style={{ lineHeight: "2.2rem" }}>
                        <th
                          className="text-end"
                          style={{
                            backgroundColor: "#f8f9fa",
                            padding: "10px",
                            border: "2px solid #6c757d",
                            width: "25%",
                          }}
                        >
                          عنوان الموكل:
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          <input
                            type="text"
                            className="form-control text-end"
                            name="address"
                            value={editedClient.address || ""}
                            onChange={handleEditInputChange}
                            style={{
                              fontSize: "1rem",
                              padding: "10px",
                              border: "1px solid #6c757d",
                            }}
                          />
                        </td>
                      </tr>
                      <tr style={{ lineHeight: "2.2rem" }}>
                        <th
                          className="text-end"
                          style={{
                            backgroundColor: "#f8f9fa",
                            padding: "10px",
                            border: "2px solid #6c757d",
                            width: "25%",
                          }}
                        >
                          جنسية الموكل:
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          <input
                            type="text"
                            className="form-control text-end"
                            name="nationality"
                            value={editedClient.nationality || ""}
                            onChange={handleEditInputChange}
                            style={{
                              fontSize: "1rem",
                              padding: "10px",
                              border: "1px solid #6c757d",
                            }}
                          />
                        </td>
                      </tr>
                      <tr style={{ lineHeight: "2.2rem" }}>
                        <th
                          className="text-end"
                          style={{
                            backgroundColor: "#f8f9fa",
                            padding: "10px",
                            border: "2px solid #6c757d",
                            width: "25%",
                          }}
                        >
                          اسم الشركة (إن وجد):
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          <input
                            type="text"
                            className="form-control text-end"
                            name="company_name"
                            value={editedClient.company_name || ""}
                            onChange={handleEditInputChange}
                            style={{
                              fontSize: "1rem",
                              padding: "10px",
                              border: "1px solid #6c757d",
                            }}
                          />
                        </td>
                      </tr>
                      <tr style={{ lineHeight: "2.2rem" }}>
                        <th
                          className="text-end"
                          style={{
                            backgroundColor: "#f8f9fa",
                            padding: "10px",
                            border: "2px solid #6c757d",
                            width: "25%",
                          }}
                        >
                          ملاحظات إضافية:
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          <textarea
                            className="form-control text-end"
                            name="notes"
                            value={editedClient.notes || ""}
                            onChange={handleEditInputChange}
                            style={{
                              fontSize: "1rem",
                              padding: "10px",
                              border: "1px solid #6c757d",
                            }}
                          ></textarea>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
              <div className="modal-footer" style={{ padding: "15px" }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpdateClient}
                  style={{ fontSize: "1.1rem" }}
                >
                  حفظ التعديلات
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  style={{ fontSize: "1.1rem" }}
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
        {showEditModal && <div className="modal-backdrop fade show"></div>}
        {showModal && <div className="modal-backdrop fade show"></div>}
      </>
    </div>
  );
};

export default Customers;
