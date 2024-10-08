
import ManageOrderContent from "../../components/contents/employeeContents/EmployeeOrderContents";
import EmployeeNavbar from "../../components/navbar/NavbarEmployee";
import EmployeeSidebar from "../../components/sidebar/SidebarEmployee";

export default function ManageOrderEmployee() {
  return (
    <>
      <EmployeeNavbar />
      <EmployeeSidebar />
      <ManageOrderContent />
    </>
  );
}
