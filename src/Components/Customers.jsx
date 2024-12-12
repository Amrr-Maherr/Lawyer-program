import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Customers = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
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
        title: "جاري تحميل بيانات العملاء",
        text: "الرجاء الانتظار...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [navigate]);

  const handleViewDetails = async (client) => {
    Swal.fire({
      title: "جاري تحميل بيانات العميل",
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
  };

  const handleEdit = (client) => {
    Swal.fire({
      title: "تعديل اسم العميل",
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
            Swal.fire("تم التعديل!", "تم تعديل اسم العميل بنجاح.", "success");
            setClients((prevClients) =>
              prevClients.map((item) =>
                item.id === client.id ? { ...item, name: updatedName } : item
              )
            );
          })
          .catch(() => {
            Swal.fire("خطأ", "حدث خطأ أثناء تعديل اسم العميل", "error");
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
            Swal.fire("تم الحذف!", "تم حذف العميل بنجاح.", "success");
            setClients((prevClients) =>
              prevClients.filter((client) => client.id !== id)
            );
          })
          .catch(() => {
            Swal.fire("خطأ", "حدث خطأ أثناء حذف العميل", "error");
          });
      }
    });
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="text-center">
      {loading ? (
        <div className="d-flex justify-content-center align-items-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">جارٍ التحميل...</span>
          </div>
          <span className="ms-2">جاري تحميل البيانات...</span>
        </div>
      ) : (
        <>
          <div className="container">
            <div className="row p-0">
              <div className="col-md-6 col-12 my-3 d-flex align-items-center justify-content-center">
                <input
                  type="text"
                  className="form-control ms-3 w-50"
                  placeholder="ابحث عن عميل بالاسم"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-6 col-12 my-3">
                <h1 className="py-4 fs-2 fw-bold">قائمة العملاء</h1>
              </div>
            </div>
          </div>
          <div className="table-responsive">
            <table
              className="table table-striped table-bordered table-hover w-100"
              dir="rtl"
              style={{ tableLayout: "fixed", maxWidth: "100%" }}
            >
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>اسم العميل</th>
                  <th>رقم الهاتف</th>
                  <th>الجنسية</th>
                  <th style={{ maxWidth: "200px", wordBreak: "break-all" }}>
                    العنوان
                  </th>
                  <th className="text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client, index) => (
                    <tr key={client.id || index}>
                      <td>{index + 1}</td>
                      <td>{client.name}</td>
                      <td>{client.phone}</td>
                      <td>{client.nationality}</td>
                      <td style={{ maxWidth: "200px", wordBreak: "break-all" }}>
                        {client.address}
                      </td>
                      <td className="d-flex flex-wrap justify-content-center gap-2">
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() => handleViewDetails(client)}
                        >
                          <i className="fa fa-eye"></i>
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleEdit(client)}
                        >
                          <i className="fa fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(client.id)}
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-danger fs-4">
                      لا توجد عملاء.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div
            className={`modal fade ${showModal ? "show" : ""}`}
            tabIndex="-1"
            aria-labelledby="clientDetailsModal"
            aria-hidden={!showModal}
            style={{ display: showModal ? "block" : "none" }}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-dark text-white">
                  <h5 className="modal-title w-100 text-end">تفاصيل العميل</h5>
                </div>
                <div className="modal-body" dir="rtl">
                  {selectedClient && (
                    <table className="table table-hover table-bordered">
                      <tbody>
                        <tr>
                          <th className="text-end">الاسم:</th>
                          <td className="text-end">{selectedClient.name}</td>
                        </tr>
                        <tr>
                          <th className="text-end">البريد الإلكتروني:</th>
                          <td className="text-end">{selectedClient.email}</td>
                        </tr>
                        <tr>
                          <th className="text-end">رقم الهوية:</th>
                          <td className="text-end">
                            {selectedClient.ID_number}
                          </td>
                        </tr>
                        <tr>
                          <th className="text-end">رقم الهاتف:</th>
                          <td className="text-end">{selectedClient.phone}</td>
                        </tr>
                        <tr>
                          <th className="text-end">العنوان:</th>
                          <td className="text-end">{selectedClient.address}</td>
                        </tr>
                        <tr>
                          <th className="text-end">الجنسية:</th>
                          <td className="text-end">
                            {selectedClient.nationality}
                          </td>
                        </tr>
                        <tr>
                          <th className="text-end">اسم الشركة:</th>
                          <td className="text-end">
                            {selectedClient.company_name}
                          </td>
                        </tr>
                        <tr>
                          <th className="text-end">الملاحظات:</th>
                          <td
                            className="text-end"
                            style={{
                              wordWrap: "break-word",
                              whiteSpace: "normal",
                            }}
                          >
                            {selectedClient.notes}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>

          {showModal && <div className="modal-backdrop fade show"></div>}
        </>
      )}
      <div className="container my-4">
        <div className="row text-center">
          <div className="col-md-6 col-12 my-3">
            <Link to="/AddCustomer" className="btn btn-dark px-5 py-2">
              <i className="fa fa-plus me-2"></i> إضافة عميل جديد
            </Link>
          </div>
          <div className="col-md-6 col-12 my-3">
            <Link to="/customer-categories" className="btn btn-dark px-5 py-2">
              <i className="fa fa-list me-2"></i> إضافة نوع عميل جديد
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;
