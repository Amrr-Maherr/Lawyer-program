import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Cases = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // إضافة حالة البحث

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get(
          "https://law-office.al-mosa.com/api/cases",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setData(response.data.cases);
        setLoading(false);
      } catch (err) {
        setError("فشل في استرجاع البيانات");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDetails = async (customerId, caseId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://law-office.al-mosa.com/api/customer/${customerId}/case/${caseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSelectedCase(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching case details:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCase(null);
  };

  const handleDelete = (customerId, caseId) => {
    // تأكيد الحذف باستخدام SweetAlert
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من استرجاع هذه القضية!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذفها!",
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");

        // إرسال طلب الحذف إلى الـ API باستخدام معرّفين
        axios
          .delete(
            `https://law-office.al-mosa.com/api/customer/${customerId}/case/${caseId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then(() => {
            // تحديث الحالة بعد الحذف
            setData(data.filter((item) => item.case_id !== caseId));
            Swal.fire("تم الحذف!", "تم حذف القضية بنجاح.", "success");
          })
          .catch((error) => {
            console.error("Error deleting case:", error);
            Swal.fire("خطأ!", "حدث خطأ أثناء الحذف.", "error");
          });
      }
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredData = data.filter((item) =>
    item.case_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>جاري التحميل...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container-fluid my-5">
      <div className="container my-4">
        <div className="row">
          <div className="col-xl-6 col-12">
            <input
              type="text"
              className="form-control w-50"
              placeholder="ابحث عن القضية"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="col-xl-6 col-12">
            <h2 className="text-end">بيانات القضايا</h2>
          </div>
        </div>
      </div>

      {/* جدول القضايا */}
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>الإجراءات</th>
            <th>السعر الإجمالي</th>
            <th>المبلغ المتبقي</th>
            <th>المبلغ المدفوع</th>
            <th>فئة القضية</th>
            <th>فئة العميل</th>
            <th>رقم القضية</th>
            <th>اسم العميل</th>
            <th>رقم الهاتف</th>
            <th>#</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((item, index) => (
              <tr key={item.case_id}>
                <td>
                  <button
                    className="btn btn-info text-end"
                    onClick={() =>
                      handleDetails(item.customer_id, item.case_id)
                    }
                  >
                    <i className="fa fa-info-circle"></i>
                  </button>
                  <button
                    className="btn btn-danger text-end ms-2"
                    onClick={() => handleDelete(item.customer_id, item.case_id)}
                  >
                    <i className="fa fa-trash-alt"></i>
                  </button>
                </td>
                <td>{item.contract_price}</td>
                <td>{item.remaining_amount}</td>
                <td>{item.paid_amount}</td>
                <td>{item.case_category}</td>
                <td>{item.customer_category}</td>
                <td>{item.case_number}</td>
                <td>{item.customer_name}</td>
                <td>{item.customer_phone}</td>
                <td>{index + 1}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" className="text-center">
                {searchTerm
                  ? "لا توجد نتائج تطابق بحثك."
                  : "لا توجد قضايا حالياً."}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* مودال عرض تفاصيل القضية */}
      <div
        className={`modal fade ${showModal ? "show" : ""}`}
        tabIndex="-1"
        aria-labelledby="caseDetailsModal"
        aria-hidden={!showModal}
        style={{ display: showModal ? "block" : "none" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title text-end w-100">تفاصيل القضية</h5>
            </div>
            <div className="modal-body" dir="rtl">
              {selectedCase && (
                <>
                  <table className="table table-hover table-bordered">
                    <tbody>
                      <tr>
                        <th className="text-end">رقم القضية:</th>
                        <td className="text-end">
                          {selectedCase.case.case_number}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-end">اسم المدعى عليه:</th>
                        <td className="text-end">
                          {selectedCase.case.opponent_name}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-end">هاتف المدعى عليه:</th>
                        <td className="text-end">
                          {selectedCase.case.opponent_phone}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-end">عنوان المدعى عليه:</th>
                        <td className="text-end">
                          {selectedCase.case.opponent_address}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-end">محكمة القضية:</th>
                        <td className="text-end">
                          {selectedCase.case.court_name}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-end">اسم القاضي:</th>
                        <td className="text-end">
                          {selectedCase.case.judge_name}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-end">المبلغ المدفوع:</th>
                        <td className="text-end">{selectedCase.paid_amount}</td>
                      </tr>
                      <tr>
                        <th className="text-end">المبلغ المتبقي:</th>
                        <td className="text-end">
                          {selectedCase.remaining_amount}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-end">السعر الإجمالي:</th>
                        <td className="text-end">
                          {selectedCase.case.contract_price}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <h4>تفاصيل العميل:</h4>
                  <table className="table table-hover table-bordered">
                    <tbody>
                      <tr>
                        <th className="text-end">اسم العميل:</th>
                        <td className="text-end">
                          {selectedCase.customer.name}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-end">البريد الإلكتروني:</th>
                        <td className="text-end">
                          {selectedCase.customer.email}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-end">رقم الهاتف:</th>
                        <td className="text-end">
                          {selectedCase.customer.phone}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-end">العنوان:</th>
                        <td className="text-end">
                          {selectedCase.customer.address}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-end">الجنسية:</th>
                        <td className="text-end">
                          {selectedCase.customer.nationality}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <h4>فئة القضية:</h4>
                  <table className="table table-hover table-bordered">
                    <tbody>
                      <tr>
                        <th className="text-end">الفئة:</th>
                        <td className="text-end">
                          {selectedCase.case.case_category}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </>
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
    </div>
  );
};

export default Cases;
