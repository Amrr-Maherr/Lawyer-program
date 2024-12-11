import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // إضافة Link من react-router-dom

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState([]); // لتخزين بيانات الجلسات من API
  const [loading, setLoading] = useState(true); // حالة تحميل البيانات

  // دالة للحصول على اسم الشهر
  const getMonthName = (monthIndex) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthIndex];
  };

  // دالة لحساب بداية الأسبوع
  const getStartOfWeek = (date) => {
    const startOfWeek = new Date(date);
    const dayOfWeek = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - dayOfWeek;
    startOfWeek.setDate(diff);
    return startOfWeek;
  };

  // دالة لحساب الأيام في الأسبوع
  const getDaysOfWeek = (startOfWeek) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // تغيير الأسبوع
  const changeWeek = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset * 7);
    setCurrentDate(newDate);
  };

  // جلب الجلسات حسب التاريخ
  const getSessionsForDay = (day) => {
    const selectedDate = `${day.getFullYear()}-${(day.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${day.getDate().toString().padStart(2, "0")}`;
    return sessions.filter((session) => session.date === selectedDate);
  };

  // جلب البيانات من الاند بوينت باستخدام Axios
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem("token"); // جلب التوكن من اللوكال ستوريج
        const response = await axios.get(
          "https://law-office.al-mosa.com/api/sessions",
          {
            headers: {
              Authorization: `Bearer ${token}`, // إضافة التوكن في الهيدر
            },
          }
        );
        setSessions(response.data.sessions); // تخزين الجلسات في الحالة
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []); // يتم جلب البيانات مرة واحدة عند تحميل الكومبوننت

  // حساب بداية الأسبوع والأيام
  const startOfWeek = getStartOfWeek(currentDate);
  const daysOfWeek = getDaysOfWeek(startOfWeek);

  const renderDays = () => {
    return daysOfWeek.map((day, index) => {
      const daySessions = getSessionsForDay(day);
      const isSessionDay = daySessions.length > 0; // تحديد إذا كان اليوم يحتوي على جلسات

      // بناء التلميح ليعرض عناوين الجلسات
      const tooltipText = daySessions
        .map((session) => session.title)
        .join(", ");

      return (
        <div key={index} className="col text-center p-2">
          {isSessionDay ? (
            <Link to="/sessions">
              {" "}
              {/* الرابط إلى صفحة الجلسات العامة */}
              <button
                className={`btn btn-outline-dark btn-lg w-100 ${
                  isSessionDay ? "bg-danger text-white" : ""
                }`}
                data-toggle="tooltip"
                title={tooltipText} // عرض عناوين الجلسات في التولتيب
              >
                {day.getDate()}
              </button>
            </Link>
          ) : (
            <button className="btn btn-outline-dark btn-lg w-100">
              {day.getDate()}
            </button>
          )}
        </div>
      );
    });
  };

  useEffect(() => {
    // تفعيل التولتيب بعد تحميل البيانات
    const tooltipTriggerList = document.querySelectorAll(
      '[data-toggle="tooltip"]'
    );
    const tooltipList = [...tooltipTriggerList].map(
      (tooltipTriggerEl) => new window.bootstrap.Tooltip(tooltipTriggerEl)
    );
    return () => {
      tooltipList.forEach((tooltip) => tooltip.dispose());
    };
  }, [sessions]);

  if (loading) {
    return <div>Loading...</div>; // عرض حالة التحميل
  }

  return (
    <div className="container mt-5">
      <div className="row mb-4">
        <div className="col text-center">
          <button
            className="btn btn-outline-secondary btn-lg"
            onClick={() => changeWeek(-1)}
          >
            &lt; Prev Week
          </button>
          <h4 className="d-inline-block mx-3">
            {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
          </h4>
          <button
            className="btn btn-outline-secondary btn-lg"
            onClick={() => changeWeek(1)}
          >
            Next Week &gt;
          </button>
        </div>
      </div>

      <div className="row" style={{ gap: "5px" }}>
        {renderDays()}
      </div>
    </div>
  );
};

export default Calendar;
