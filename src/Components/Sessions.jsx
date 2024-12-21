import React, { useState, useEffect, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import axios from "axios";
import "@fortawesome/fontawesome-free/css/all.css";

function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSessionData, setEditSessionData] = useState(null);
  const [editSessionForm, setEditSessionForm] = useState({
    title: "",
    description: "",
    date: "",
  });

  const API_BASE_URL = "https://law-office.al-mosa.com/api";
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };
  const createAxiosInstance = () => {
    const token = getAuthToken();
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        Authorization: token ? `Bearer ${token}` : null,
      },
    });
  };
  const api = createAxiosInstance();

  useEffect(() => {
    Swal.fire({
      title: "جاري تحميل الجلسات...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: async () => {
        Swal.showLoading();
        try {
          const response = await api.get("/sessions");
          setSessions([...response.data.sessions].reverse());
        } catch (err) {
          Swal.fire("خطأ!", "فشل تحميل الجلسات.", "error");
        } finally {
          Swal.close();
          setLoading(false);
        }
      },
    });
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      return (
        session.title &&
        session.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [sessions, searchTerm]);

  const handleDeleteSession = async (session) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذفها!",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { customer_id, case_id, session_id } = session;
          await api.delete(
            `/customer/${customer_id}/case/${case_id}/session/${session_id}`
          );
          setSessions(sessions.filter((s) => s.session_id !== session_id));
          Swal.fire("تم الحذف!", "تم حذف الجلسة بنجاح.", "success");
        } catch (err) {
          Swal.fire("خطأ!", "فشل حذف الجلسة.", "error");
        }
      }
    });
  };

  const handleEditSession = (session) => {
    setEditSessionData(session);
    setEditSessionForm({
      title: session.title,
      description: session.description,
      date: session.date,
    });
    setIsModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleEditSessionInputChange = (e) => {
    const { name, value } = e.target;
    setEditSessionForm({ ...editSessionForm, [name]: value });
  };

  const handleUpdateSession = async () => {
    Swal.fire({
      title: "جاري تحديث الجلسة...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: async () => {
        Swal.showLoading();
        try {
          const { customer_id, case_id, session_id } = editSessionData;
          const response = await api.post(
            `/customer/${customer_id}/case/${case_id}/update-session/${session_id}`,
            editSessionForm
          );

          if (response.status === 200) {
            const updatedSessions = sessions.map((session) =>
              session.session_id === editSessionData.session_id
                ? { ...session, ...editSessionForm }
                : session
            );

            setSessions(updatedSessions);
            handleCloseEditModal(true);
            Swal.fire("تم التحديث!", "تم تحديث الجلسة بنجاح.", "success");
          } else {
            const error = await response.json();
            Swal.fire("خطأ!", error.message || "فشل تحديث الجلسة.", "error");
          }
        } catch (error) {
          Swal.fire("خطأ!", "فشل تحديث الجلسة.", "error");
        } finally {
          Swal.close();
        }
      },
    });
  };

  const handleShowDetails = async (session) => {
    Swal.fire({
      title: "جاري تحميل التفاصيل...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: async () => {
        Swal.showLoading();
        try {
          const response = await api.get(
            `/customer/${session.customer_id}/case/${session.case_id}/session/${session.session_id}`
          );
          setSelectedSession(response.data);
          setIsEditModalOpen(false);
          setIsModalOpen(true);
          Swal.close();
        } catch (err) {
          Swal.fire("خطأ!", "فشل تحميل تفاصيل الجلسة.", "error");
        }
      },
    });
  };

  const handleCloseModal = () => {
    setSelectedSession(null);
    setIsModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setEditSessionData(null);
    setIsEditModalOpen(false);
  };

  function SessionCard({
    session,
    handleShowDetails,
    handleDeleteSession,
    handleEditSession,
  }) {
    return (
      <div className="col-xl-4 my-3">
        <div
          className="card h-100 session-card"
          dir="rtl"
          style={{ backgroundColor: "#fff" }}
        >
          <div
            className="card-header session-card-header text-white d-flex justify-content-between align-items-center"
            style={{ backgroundColor: "#1a237e" }}
          >
            <h5 className="card-title mb-0 text-start flex-grow-1 ps-2 w-100 text-end">
              {session.title}
            </h5>
            <i className="fas fa-calendar-alt fs-4 me-2"></i>
          </div>
          <div className="card-body">
            <div className="d-flex flex-column gap-2">
              <div className="d-flex justify-content-between align-items-center">
                <span
                  className="text-bold me-2"
                  style={{ fontSize: "1.1rem", color: "#343a40" }}
                >
                  <i className="fas fa-list-ol ms-2"></i>
                  رقم القضية:
                </span>
                <span
                  className="text-start"
                  style={{ fontSize: "1rem", color: "#343a40" }}
                >
                  {session.case_number}
                </span>
              </div>
              <hr className="my-2" style={{ margin: "5px 0" }} />
              <div className="d-flex justify-content-between align-items-center">
                <span
                  className="text-bold me-2"
                  style={{ fontSize: "1.1rem", color: "#343a40" }}
                >
                  <i className="fas fa-user ms-2"></i>
                  اسم الموكل:
                </span>
                <span
                  className="text-start"
                  style={{ fontSize: "1rem", color: "#343a40" }}
                >
                  {session.customer_name}
                </span>
              </div>
              <hr className="my-2" style={{ margin: "5px 0" }} />
              <div className="d-flex justify-content-between align-items-start">
                <span
                  className="text-bold me-2"
                  style={{ fontSize: "1.1rem", color: "#343a40" }}
                >
                  <i className="fas fa-info-circle ms-2"></i>
                  ملخص الجلسة:
                </span>
                <span
                  className="text-start"
                  style={{ fontSize: "1rem", color: "#343a40" }}
                >
                  {session.description}
                </span>
              </div>
              <hr className="my-2" style={{ margin: "5px 0" }} />
              <div className="d-flex justify-content-between align-items-center">
                <span
                  className="text-bold me-2"
                  style={{ fontSize: "1.1rem", color: "#343a40" }}
                >
                  <i className="fas fa-calendar ms-2"></i>
                  تاريخ الجلسة:
                </span>
                <span
                  className="text-start"
                  style={{ fontSize: "1rem", color: "#343a40" }}
                >
                  {session.date}
                </span>
              </div>
              <hr className="my-2" style={{ margin: "5px 0" }} />
            </div>
            <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
              <button
                className="btn btn-info btn-sm session-button"
                onClick={() => handleShowDetails(session)}
                style={{ backgroundColor: "#0dcaf0", color: "#fff" }}
              >
                <i className="fa fa-info-circle ms-1"></i> تفاصيل
              </button>
              <button
                className="btn btn-primary btn-sm session-button"
                onClick={() => handleEditSession(session)}
                style={{ backgroundColor: "#0d6efd", color: "#fff" }}
              >
                <i className="fa fa-edit ms-1"></i> تعديل
              </button>
              <button
                className="btn btn-danger btn-sm session-button"
                onClick={() => handleDeleteSession(session)}
                style={{ backgroundColor: "#dc3545", color: "#fff" }}
              >
                <i className="fa fa-trash-alt ms-1"></i> حذف
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function SessionDetailsModal({ selectedSession, isOpen, onClose }) {
    return (
      <div
        className={`modal fade ${isOpen ? "show" : ""}`}
        id="sessionDetailsModal"
        tabIndex="-1"
        aria-labelledby="sessionDetailsModalLabel"
        style={{ display: isOpen ? "block" : "none" }}
        aria-modal="true"
        role="dialog"
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
              className="modal-header text-white d-flex justify-content-between align-items-center"
              style={{ padding: "15px", backgroundColor: "#1a237e" }}
            >
              <h5
                className="modal-title m-0 text-end w-100"
                id="sessionDetailsModalLabel"
                style={{ fontSize: "1.4rem" }}
              >
                تفاصيل الجلسة
              </h5>
            </div>
            <div className="modal-body" dir="rtl" style={{ padding: "20px" }}>
              {selectedSession && (
                <div className="container">
                  <h4 className="mb-3 text-center">معلومات الجلسة</h4>
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
                          عنوان الجلسة
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          {selectedSession.title}
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
                          تاريخ الجلسة
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          {selectedSession.date}
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
                          ملخص الجلسة
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
                          {selectedSession.description}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <h4 className="mb-3 text-center">بيانات القضية</h4>
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
                          رقم القضية
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          {selectedSession.case?.case_number}
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
                          موضوع القضية
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          {selectedSession.case?.case_title}
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
                          أتعاب المحاماة
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          {selectedSession.case?.contract_price}
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
                          المحكمة المختصة
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          {selectedSession.case?.court_name}
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
                          اسم القاضي
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          {selectedSession.case?.judge_name}
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
                          ملاحظات إضافية
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
                          {selectedSession.case?.notes}
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
                          اسم الخصم
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          {selectedSession.case?.opponent_name}
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
                          هاتف الخصم
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          {selectedSession.case?.opponent_phone}
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
                          جنسية الخصم
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          {selectedSession.case?.opponent_nation}
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
                          عنوان الخصم
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          {selectedSession.case?.opponent_address}
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
                          اسم محامي الخصم
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          {selectedSession.case?.opponent_lawyer}
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
                          هاتف محامي الخصم
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          {selectedSession.case?.lawyer_phone}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <h4 className="mb-3 text-center">بيانات الموكل</h4>
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
                          اسم الموكل
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          {selectedSession.case?.customer?.name}
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
                          رقم الهوية/السجل التجاري
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          {selectedSession.case?.customer?.ID_number}
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
                          البريد الإلكتروني
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          {selectedSession.case?.customer?.email}
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
                          رقم الهاتف
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          {selectedSession.case?.customer?.phone}
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
                          العنوان
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          {selectedSession.case?.customer?.address}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ padding: "15px" }}>
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={onClose}
                style={{ fontSize: "1.1rem" }}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function SessionEditModal({
    isOpen,
    onClose,
    editSessionData,
    editSessionForm,
    handleEditSessionInputChange,
    handleUpdateSession,
  }) {
    return (
      <div
        className={`modal fade ${isOpen ? "show" : ""}`}
        id="editSessionModal"
        tabIndex="-1"
        aria-labelledby="editSessionModalLabel"
        aria-hidden="true"
        style={{ display: isOpen ? "block" : "none" }}
        aria-modal="true"
        role="dialog"
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
              className="modal-header text-white d-flex justify-content-between align-items-center"
              style={{ padding: "15px", backgroundColor: "#1a237e" }}
            >
              <h5
                className="modal-title m-0 text-end"
                id="editSessionModalLabel"
                style={{ fontSize: "1.4rem" }}
              >
                تعديل الجلسة
              </h5>
            </div>
            <div className="modal-body" dir="rtl" style={{ padding: "20px" }}>
              {editSessionData && (
                <div className="container">
                  <h4 className="mb-3 text-center">تعديل بيانات الجلسة</h4>
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
                          عنوان الجلسة
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
                            name="title"
                            value={editSessionForm.title}
                            onChange={handleEditSessionInputChange}
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
                          }}
                        >
                          تاريخ الجلسة
                        </th>
                        <td
                          className="text-end"
                          style={{
                            padding: "10px",
                            border: "2px solid #6c757d",
                          }}
                        >
                          <input
                            type="date"
                            className="form-control text-end"
                            name="date"
                            value={editSessionForm.date}
                            onChange={handleEditSessionInputChange}
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
                          }}
                        >
                          ملخص الجلسة
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
                            name="description"
                            value={editSessionForm.description}
                            onChange={handleEditSessionInputChange}
                            style={{
                              fontSize: "1rem",
                              padding: "10px",
                              border: "1px solid #6c757d",
                            }}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ padding: "15px" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                data-bs-dismiss="modal"
                style={{ fontSize: "1.1rem" }}
              >
                إغلاق
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUpdateSession}
                style={{ fontSize: "1.1rem" }}
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="sessions my-4"
      style={{ backgroundColor: "#f0f0f0", minHeight: "100vh" }}
    >
      <div
        className=" container  py-5 mb-4 d-flex align-items-center justify-content-between"
        style={{ direction: "rtl" }}
      >
        <div className="col-xl-6 col-12">
          <div className="d-flex align-items-center">
            <i className="fas fa-calendar-alt me-2 ms-3" style={{ color: "#1a237e" }}></i>
            <h2 className="mb-0" style={{ fontWeight: "bold", color: "#1a237e" }}>
              إدارة الجلسات
            </h2>
          </div>
        </div>
        <div className="col-xl-6 col-12">
          <div className="me-auto" style={{ maxWidth: "300px" }}>
            <input
              type="text"
              className="form-control text-end"
              placeholder="ابحث عن جلسة..."
              value={searchTerm}
              onChange={handleSearch}
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
        </div>
      </div>
      <div className="container">
        <div className="row row-cols-1 row-cols-md-3 g-4 flex-row-reverse">
          {filteredSessions.map((session) => (
            <SessionCard
              key={session.session_id}
              session={session}
              handleShowDetails={handleShowDetails}
              handleDeleteSession={handleDeleteSession}
              handleEditSession={handleEditSession}
            />
          ))}
        </div>
      </div>
      {isEditModalOpen && <div className="modal-backdrop fade show"></div>}
      {isModalOpen && <div className="modal-backdrop fade show"></div>}
      <SessionDetailsModal
        selectedSession={selectedSession}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
      <SessionEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        editSessionData={editSessionData}
        editSessionForm={editSessionForm}
        handleEditSessionInputChange={handleEditSessionInputChange}
        handleUpdateSession={handleUpdateSession}
      />
    </div>
  );
}

export default Sessions;