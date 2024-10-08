import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
const BASE_URL = "http://localhost:8082";
export default function OrderUser({
  idmypackage,
  mypackage,
  fabrisoftener,
  idfabrisoftener,
  watertmp,
  idwatertmp,
  status,
  orderId,
}) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [packageData, setPackageData] = useState();
  const [softenerData, setSoftener] = useState();
  const [TempData, setTemp] = useState();

  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
  };

  const fetchUpload = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      console.error("No token found");
      setError("No token found");
      return;
    }
    if (!selectedImage) return;
    // console.log(selectedImage);
    const formData = new FormData();
    formData.append("file", selectedImage, {
      type: "image/jpeg",
    });

    try {
      const responseUpload = await fetch(
        `${BASE_URL}/orders/upload?id=${orderId}`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (responseUpload.ok) {
        const responseUpdateStatus = fetch(`${BASE_URL}/orders/Status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: orderId, status: "Payment Transferred" }),
        });
        if (!responseUpdateStatus.ok) {
          Swal.fire({
            title: "Success!",
            text: "Upload successful.",
            icon: "success",
            confirmButtonText: "OK",
          }).then((result) => {
            if (result.isConfirmed) {
              navigate("/history");
              window.location.reload();
            }
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: "Network response was not ok.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      } else {
        Swal.fire({
          title: "Error!",
          text: "Network response was not ok.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  useEffect(() => {
    const fetchPackageData = async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          console.error("No token found");
          setError("No token found");
          return;
        }

        const responsePackage = await fetch(
          `${BASE_URL}/mypackage/readById?id=${idmypackage}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const responseSoftener = await fetch(
          `${BASE_URL}/fab/readById?id=${idfabrisoftener}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const responseTemp = await fetch(
          `${BASE_URL}/water/readById?id=${idwatertmp}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!responsePackage.ok) {
          throw new Error(`HTTP error! status: ${responsePackage.status}`);
        }

        if (!responseSoftener.ok) {
          throw new Error(`HTTP error! status: ${responseSoftener.status}`);
        }

        if (!responseTemp.ok) {
          throw new Error(`HTTP error! status: ${responseTemp.status}`);
        }

        const resultPackage = await responsePackage.json();
        const resultSoftener = await responseSoftener.json();
        const resultTemp = await responseTemp.json();

        if (resultPackage.data) {
          setPackageData(resultPackage.data);
        } else {
          throw new Error("Data received is not an array");
        }

        if (resultSoftener.data) {
          setSoftener(resultSoftener.data);
        } else {
          throw new Error("Data received is not an array");
        }

        if (resultTemp.data) {
          setTemp(resultTemp.data);
        } else {
          throw new Error("Data received is not an array");
        }
      } catch (error) {
        console.error("Fetch error:", error.message);
        setError("Failed to fetch data from server.");
      }
    };

    fetchPackageData();
  }, []);
  //  console.log(TempData);

  const deleteOrder = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("userToken");

      if (!token) {
        Swal.fire({
          title: "Error!",
          text: "No token found. Please login.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }

      Swal.fire({
        title: "Are you sure?",
        text: "You will delete the order.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it",
        cancelButtonText: "Cancel",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const responseDelete = await fetch(
            `${BASE_URL}/orders/delete?id=${orderId}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (responseDelete.ok) {
            Swal.fire({
              title: "Deleted!",
              text: "Your order has been deleted.",
              icon: "success",
              confirmButtonText: "OK",
            }).then((result) => {
              if (result.isConfirmed) {
                window.location.reload();
              }
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: "Network response was not ok",
              icon: "error",
              confirmButtonText: "OK",
            });
          }
        }
      });
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to delete the order.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="p-4">
      <div className="bg-pink-200 text-teal-800 p-4 rounded-md hover:bg-pink-300 flex justify-center items-center w-72">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold">Size: {mypackage}</h1>

          <p>ราคา: {packageData?.price} บาท</p>
          <p>ซัก: {packageData?.wash} kg</p>
          <p>อบ: {packageData?.dry} นาที</p>
          <p>น้ำยาปรับผ้านุ่ม: {fabrisoftener} </p>
          <p>อุณหภูมิน้ำ: {watertmp} </p>
          <p>สถานะ: {status}</p>
          <h2 className="text-xl font-bold">
            ราคารวม:{" "}
            {softenerData?.price + TempData?.price + packageData?.price} บาท
          </h2>
          <div className="flex flex-wrap">
            <div className="px-2">
              <button
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded "
                type="submit"
                onClick={openModal}
              >
                ชำระเงิน
              </button>
            </div>
            <div className="px-2">
              <button
                className="mt-4 bg-red-700 text-white px-4 py-2 rounded"
                onClick={deleteOrder}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-2xl font-semibold mb-4">การชำระเงิน</h2>
            <img src="/src/assets/pp.jpg" />
            <h2 className="text-xl font-bold">
              ราคารวม:{" "}
              {softenerData?.price + TempData?.price + packageData?.price} บาท
            </h2>
            <div className="image-upload p-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
            <div className="flex flex-wrap">
              <div className="px-2">
                <button
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded "
                  type="submit"
                  onClick={fetchUpload}
                >
                  ยืนยัน
                </button>
              </div>
              <div className="px-2">
                <button
                  className="mt-4 bg-red-700 text-white px-4 py-2 rounded"
                  onClick={closeModal}
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
