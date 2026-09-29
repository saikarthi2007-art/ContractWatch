const API = "/api/contractwatch";

let vendors = [];
let contracts = [];

let editingVendorId = null;
let editingContractId = null;


/* =========================================================
   GENERAL API FUNCTION
   ========================================================= */

async function request(url, options = {}) {

    try {

        const response = await fetch(url, options);

        if (!response.ok) {

            const errorText = await response.text();

            console.error("API Error:", errorText);

            throw new Error(
                errorText || "Request failed"
            );
        }

        if (response.status === 204) {
            return null;
        }

        return await response.json();

    } catch (error) {

        console.error("Request failed:", error);

        throw error;
    }
}


/* =========================================================
   TAB SYSTEM
   ========================================================= */

function openTab(tabId) {

    const sections =
        document.querySelectorAll(".tab-content");

    sections.forEach(section => {

        section.classList.remove("active-tab");

    });


    const buttons =
        document.querySelectorAll(".nav-btn");

    buttons.forEach(button => {

        button.classList.remove("active");

    });


    const selectedSection =
        document.getElementById(tabId);

    if (selectedSection) {

        selectedSection.classList.add("active-tab");

    }


    const selectedButton =
        document.querySelector(
            `.nav-btn[data-tab="${tabId}"]`
        );

    if (selectedButton) {

        selectedButton.classList.add("active");

    }


    /*
     * Load data whenever the user opens a tab.
     */

    if (tabId === "dashboard") {

        loadReport();

    }


    if (tabId === "vendors") {

        loadVendors();

    }


    if (tabId === "contracts") {

        loadVendors();
        loadContracts();

    }


    if (tabId === "renewals") {

        loadRenewalReminders();

    }


    if (tabId === "decisions") {

        loadContractsForDecision();

    }


    if (tabId === "documents") {

        loadContractsForDocuments();

    }


    if (tabId === "reports") {

        loadReport();

    }

}


/* =========================================================
   NAVIGATION BUTTON EVENTS
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {


    const navButtons =
        document.querySelectorAll(".nav-btn");


    navButtons.forEach(button => {

        button.addEventListener("click", function () {

            const tabId =
                this.getAttribute("data-tab");

            openTab(tabId);

        });

    });


    /*
     * Vendor buttons
     */

    document
        .getElementById("vendorSaveBtn")
        .addEventListener(
            "click",
            saveVendor
        );


    document
        .getElementById("vendorCancelBtn")
        .addEventListener(
            "click",
            clearVendorForm
        );


    /*
     * Contract buttons
     */

    document
        .getElementById("contractSaveBtn")
        .addEventListener(
            "click",
            saveContract
        );


    document
        .getElementById("contractCancelBtn")
        .addEventListener(
            "click",
            clearContractForm
        );


    /*
     * Renewal
     */

    document
        .getElementById("refreshRenewalsBtn")
        .addEventListener(
            "click",
            loadRenewalReminders
        );


    /*
     * Decision
     */

    document
        .getElementById("decisionSaveBtn")
        .addEventListener(
            "click",
            saveDecision
        );


    document
        .getElementById("decisionClearBtn")
        .addEventListener(
            "click",
            clearDecisionForm
        );


    document
        .getElementById("decisionContract")
        .addEventListener(
            "change",
            loadDecisionHistory
        );


    document
        .getElementById("decisionType")
        .addEventListener(
            "change",
            toggleNewEndDate
        );


    /*
     * Documents
     */

    document
        .getElementById("documentSaveBtn")
        .addEventListener(
            "click",
            saveDocument
        );


    document
        .getElementById("documentClearBtn")
        .addEventListener(
            "click",
            clearDocumentForm
        );


    document
        .getElementById("documentContract")
        .addEventListener(
            "change",
            loadDocuments
        );


    /*
     * Reports
     */

    document
        .getElementById("refreshReportBtn")
        .addEventListener(
            "click",
            loadReport
        );


    /*
     * Initial dashboard
     */

    loadReport();

    loadVendors();

    loadContracts();

});


/* =========================================================
   VENDORS
   ========================================================= */

async function loadVendors() {

    try {

        vendors =
            await request(
                `${API}/vendors`
            );


        renderVendors();

        populateVendorDropdown();

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}


function renderVendors() {

    const tbody =
        document.getElementById(
            "vendorTableBody"
        );


    tbody.innerHTML = "";


    if (!vendors.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    No vendors found
                </td>
            </tr>
        `;

        return;
    }


    vendors.forEach(vendor => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${vendor.id}</td>

            <td>${escapeHtml(vendor.name)}</td>

            <td>${escapeHtml(vendor.contactEmail)}</td>

            <td>${escapeHtml(vendor.phone || "-")}</td>

            <td>

                <button
                    class="action-btn edit-btn"
                    onclick="editVendor(${vendor.id})">

                    Edit

                </button>


                <button
                    class="action-btn delete-btn"
                    onclick="deleteVendor(${vendor.id})">

                    Delete

                </button>

            </td>
        `;


        tbody.appendChild(row);

    });

}


function populateVendorDropdown() {

    const dropdown =
        document.getElementById(
            "contractVendor"
        );


    dropdown.innerHTML = `
        <option value="">
            Select Vendor
        </option>
    `;


    vendors.forEach(vendor => {

        const option =
            document.createElement("option");


        option.value = vendor.id;

        option.textContent =
            `${vendor.name} (ID: ${vendor.id})`;


        dropdown.appendChild(option);

    });

}


async function saveVendor() {

    const name = document
        .getElementById("vendorName")
        .value
        .trim();

    const email = document
        .getElementById("vendorEmail")
        .value
        .trim();

    const phone = document
        .getElementById("vendorPhone")
        .value
        .trim();


    // -----------------------------
    // Required field validation
    // -----------------------------

    if (!name) {
        alert("Vendor name is required.");
        document.getElementById("vendorName").focus();
        return;
    }

    if (!email) {
        alert("Email address is required.");
        document.getElementById("vendorEmail").focus();
        return;
    }

    if (!phone) {
        alert("Mobile number is required.");
        document.getElementById("vendorPhone").focus();
        return;
    }


    // -----------------------------
    // Email validation
    // -----------------------------

    const emailRegex =
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!emailRegex.test(email)) {

        alert(
            "Please enter a valid email address.\n\n" +
            "Example: user@gmail.com"
        );

        document
            .getElementById("vendorEmail")
            .focus();

        return;
    }


    // -----------------------------
    // Mobile number validation
    // Supports:
    // 9876543210
    // +919876543210
    // +91 9876543210
    // +91-9876543210
    // -----------------------------

    const phoneRegex =
        /^(?:\+91[\s-]?)?[6-9][0-9]{9}$/;

    if (!phoneRegex.test(phone)) {

        alert(
            "Please enter a valid Indian mobile number.\n\n" +
            "Example: 9876543210"
        );

        document
            .getElementById("vendorPhone")
            .focus();

        return;
    }


    // -----------------------------
    // Prepare request
    // -----------------------------

    const data = {
        name: name,
        contactEmail: email,
        phone: phone
    };


    console.log(
        "Sending vendor request body:",
        data
    );


    // -----------------------------
    // Save / Update vendor
    // -----------------------------

    try {

        if (editingVendorId) {

            await request(
                `${API}/vendors/${editingVendorId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(data)
                }
            );

            alert(
                "Vendor updated successfully."
            );

        } else {

            await request(
                `${API}/vendors`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(data)
                }
            );

            alert(
                "Vendor added successfully."
            );
        }


        clearVendorForm();

        await loadVendors();

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Unable to save vendor."
        );
    }
}


function editVendor(id) {

    const vendor =
        vendors.find(
            v => v.id === id
        );


    if (!vendor) {

        alert("Vendor not found.");

        return;
    }


    editingVendorId = id;


    document.getElementById(
        "vendorId"
    ).value = id;


    document.getElementById(
        "vendorName"
    ).value = vendor.name;


    document.getElementById(
        "vendorEmail"
    ).value = vendor.contactEmail;


    document.getElementById(
        "vendorPhone"
    ).value = vendor.phone || "";


    document.getElementById(
        "vendorFormTitle"
    ).textContent = "Update Vendor";


    document.getElementById(
        "vendorSaveBtn"
    ).textContent = "Update Vendor";

}


async function deleteVendor(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this vendor?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await request(
            `${API}/vendors/${id}`,
            {
                method: "DELETE"
            }
        );


        alert(
            "Vendor deleted successfully."
        );


        await loadVendors();


        await loadContracts();

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}


function clearVendorForm() {

    editingVendorId = null;


    document.getElementById(
        "vendorId"
    ).value = "";


    document.getElementById(
        "vendorName"
    ).value = "";


    document.getElementById(
        "vendorEmail"
    ).value = "";


    document.getElementById(
        "vendorPhone"
    ).value = "";


    document.getElementById(
        "vendorFormTitle"
    ).textContent = "Add Vendor";


    document.getElementById(
        "vendorSaveBtn"
    ).textContent = "Add Vendor";

}


/* =========================================================
   CONTRACTS
   ========================================================= */

async function loadContracts() {

    try {

        contracts =
            await request(
                `${API}/contracts`
            );


        renderContracts();

        populateContractDropdowns();

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}


function renderContracts() {

    const tbody =
        document.getElementById(
            "contractTableBody"
        );


    tbody.innerHTML = "";


    if (!contracts.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty">
                    No contracts found
                </td>
            </tr>
        `;

        return;
    }


    contracts.forEach(contract => {

        const row =
            document.createElement("tr");


        const vendorName =
            contract.vendor
                ? contract.vendor.name
                : "-";


        row.innerHTML = `

            <td>${contract.id}</td>

            <td>
                ${escapeHtml(contract.title)}
            </td>

            <td>
                ${escapeHtml(vendorName)}
            </td>

            <td>
                ${contract.startDate}
            </td>

            <td>
                ${contract.endDate}
            </td>

            <td>
                ${contract.noticePeriodDays}
            </td>

            <td>

                <span class="status status-${contract.status}">
                    ${contract.status}
                </span>

            </td>

            <td>

                <button
                    class="action-btn edit-btn"
                    onclick="editContract(${contract.id})">

                    Edit

                </button>


                <button
                    class="action-btn delete-btn"
                    onclick="deleteContract(${contract.id})">

                    Delete

                </button>


                <button
                    class="action-btn decision-btn"
                    onclick="openDecisionForContract(${contract.id})">

                    Decision

                </button>

            </td>

        `;


        tbody.appendChild(row);

    });

}


function populateContractDropdowns() {

    const decisionDropdown =
        document.getElementById(
            "decisionContract"
        );


    const documentDropdown =
        document.getElementById(
            "documentContract"
        );


    decisionDropdown.innerHTML = `
        <option value="">
            Select Contract
        </option>
    `;


    documentDropdown.innerHTML = `
        <option value="">
            Select Contract
        </option>
    `;


    contracts.forEach(contract => {

        const option1 =
            document.createElement("option");


        option1.value = contract.id;

        option1.textContent =
            `${contract.title} (ID: ${contract.id})`;


        decisionDropdown.appendChild(
            option1
        );


        const option2 =
            document.createElement("option");


        option2.value = contract.id;

        option2.textContent =
            `${contract.title} (ID: ${contract.id})`;


        documentDropdown.appendChild(
            option2
        );

    });

}


async function saveContract() {

    const title =
        document.getElementById(
            "contractTitle"
        ).value.trim();


    const vendorId =
        document.getElementById(
            "contractVendor"
        ).value;


    const startDate =
        document.getElementById(
            "startDate"
        ).value;


    const endDate =
        document.getElementById(
            "endDate"
        ).value;


    const noticePeriod =
        document.getElementById(
            "noticePeriod"
        ).value;


    if (
        !title ||
        !vendorId ||
        !startDate ||
        !endDate ||
        !noticePeriod
    ) {

        alert(
            "Please fill all contract fields."
        );

        return;
    }


    const data = {

        title: title,

        vendor: {
            id: Number(vendorId)
        },

        startDate: startDate,

        endDate: endDate,

        noticePeriodDays:
            Number(noticePeriod)

    };


    console.log(
        "Sending contract request body:",
        data
    );


    try {

        if (editingContractId) {

            await request(
                `${API}/contracts/${editingContractId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(data)
                }
            );


            alert(
                "Contract updated successfully."
            );

        } else {

            await request(
                `${API}/contracts`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(data)
                }
            );


            alert(
                "Contract added successfully."
            );

        }


        clearContractForm();

        await loadContracts();

        await loadReport();

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}


function editContract(id) {

    const contract =
        contracts.find(
            c => c.id === id
        );


    if (!contract) {

        alert("Contract not found.");

        return;
    }


    editingContractId = id;


    document.getElementById(
        "contractId"
    ).value = id;


    document.getElementById(
        "contractTitle"
    ).value = contract.title;


    document.getElementById(
        "contractVendor"
    ).value =
        contract.vendor
            ? contract.vendor.id
            : "";


    document.getElementById(
        "startDate"
    ).value = contract.startDate;


    document.getElementById(
        "endDate"
    ).value = contract.endDate;


    document.getElementById(
        "noticePeriod"
    ).value =
        contract.noticePeriodDays;


    document.getElementById(
        "contractFormTitle"
    ).textContent =
        "Update Contract";


    document.getElementById(
        "contractSaveBtn"
    ).textContent =
        "Update Contract";


    openTab("contracts");

}


async function deleteContract(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this contract?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await request(
            `${API}/contracts/${id}`,
            {
                method: "DELETE"
            }
        );


        alert(
            "Contract deleted successfully."
        );


        await loadContracts();

        await loadReport();

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}


function clearContractForm() {

    editingContractId = null;


    document.getElementById(
        "contractId"
    ).value = "";


    document.getElementById(
        "contractTitle"
    ).value = "";


    document.getElementById(
        "contractVendor"
    ).value = "";


    document.getElementById(
        "startDate"
    ).value = "";


    document.getElementById(
        "endDate"
    ).value = "";


    document.getElementById(
        "noticePeriod"
    ).value = "";


    document.getElementById(
        "contractFormTitle"
    ).textContent =
        "Add Contract";


    document.getElementById(
        "contractSaveBtn"
    ).textContent =
        "Add Contract";

}


/* =========================================================
   RENEWAL REMINDERS
   ========================================================= */

async function loadRenewalReminders() {

    try {

        const reminders =
            await request(
                `${API}/contracts/renewal-reminders`
            );


        const tbody =
            document.getElementById(
                "renewalTableBody"
            );


        tbody.innerHTML = "";


        if (!reminders.length) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty">
                        No contracts require renewal review.
                    </td>
                </tr>
            `;

            return;
        }


        reminders.forEach(contract => {

            const row =
                document.createElement("tr");


            const vendorName =
                contract.vendor
                    ? contract.vendor.name
                    : "-";


            row.innerHTML = `

                <td>${contract.id}</td>

                <td>
                    ${escapeHtml(contract.title)}
                </td>

                <td>
                    ${escapeHtml(vendorName)}
                </td>

                <td>
                    ${contract.endDate}
                </td>

                <td>
                    <span class="status status-${contract.status}">
                        ${contract.status}
                    </span>
                </td>

                <td>

                    <button
                        class="action-btn decision-btn"
                        onclick="openDecisionForContract(${contract.id})">

                        Make Decision

                    </button>

                </td>

            `;


            tbody.appendChild(row);

        });

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}


/* =========================================================
   RENEWAL DECISIONS
   ========================================================= */

async function loadContractsForDecision() {

    try {

        await loadContracts();

    } catch (error) {

        console.error(error);

    }

}


function openDecisionForContract(id) {

    openTab("decisions");


    document.getElementById(
        "decisionContract"
    ).value = id;


    loadDecisionHistory();

}


function toggleNewEndDate() {

    const decision =
        document.getElementById(
            "decisionType"
        ).value;


    const newEndDate =
        document.getElementById(
            "newEndDate"
        );


    if (decision === "RENEWED") {

        newEndDate.disabled = false;

    } else {

        newEndDate.disabled = true;

        newEndDate.value = "";

    }

}


async function saveDecision() {

    const contractId =
        document.getElementById(
            "decisionContract"
        ).value;


    const decision =
        document.getElementById(
            "decisionType"
        ).value;


    const newEndDate =
        document.getElementById(
            "newEndDate"
        ).value;


    const notes =
        document.getElementById(
            "decisionNotes"
        ).value.trim();


    if (!contractId) {

        alert(
            "Please select a contract."
        );

        return;
    }


    if (!decision) {

        alert(
            "Please select a decision."
        );

        return;
    }


    if (
        decision === "RENEWED"
        &&
        !newEndDate
    ) {

        alert(
            "New end date is required for renewal."
        );

        return;
    }


    const data = {

        decision: decision,

        newEndDate:
            decision === "RENEWED"
                ? newEndDate
                : null,

        notes: notes

    };


    console.log(
        "Sending decision request body:",
        data
    );


    try {

        await request(
            `${API}/contracts/${contractId}/renewal-decision`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(data)
            }
        );


        alert(
            "Renewal decision saved successfully."
        );


        clearDecisionForm();

        await loadDecisionHistory();

        await loadContracts();

        await loadReport();

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}


async function loadDecisionHistory() {

    const contractId =
        document.getElementById(
            "decisionContract"
        ).value;


    const tbody =
        document.getElementById(
            "decisionTableBody"
        );


    tbody.innerHTML = "";


    if (!contractId) {

        return;
    }


    try {

        const history =
            await request(
                `${API}/contracts/${contractId}/renewal-decisions`
            );


        if (!history.length) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty">
                        No decision history found.
                    </td>
                </tr>
            `;

            return;
        }


        history.forEach(item => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>${item.id}</td>

                <td>${item.decision}</td>

                <td>
                    ${item.newEndDate || "-"}
                </td>

                <td>
                    ${item.decisionDate || "-"}
                </td>

                <td>
                    ${escapeHtml(item.notes || "-")}
                </td>

            `;


            tbody.appendChild(row);

        });

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}


function clearDecisionForm() {

    document.getElementById(
        "decisionContract"
    ).value = "";


    document.getElementById(
        "decisionType"
    ).value = "";


    document.getElementById(
        "newEndDate"
    ).value = "";


    document.getElementById(
        "newEndDate"
    ).disabled = true;


    document.getElementById(
        "decisionNotes"
    ).value = "";


    document.getElementById(
        "decisionTableBody"
    ).innerHTML = "";

}


/* =========================================================
   DOCUMENTS
   ========================================================= */

async function loadContractsForDocuments() {

    try {

        await loadContracts();

    } catch (error) {

        console.error(error);

    }

}


async function saveDocument() {

    const contractId =
        document.getElementById(
            "documentContract"
        ).value;


    const documentName =
        document.getElementById(
            "documentName"
        ).value.trim();


    const documentReference =
        document.getElementById(
            "documentReference"
        ).value.trim();


    if (!contractId) {

        alert(
            "Please select a contract."
        );

        return;
    }


    if (!documentName || !documentReference) {

        alert(
            "Document name and reference are required."
        );

        return;
    }


    const data = {

        documentName:
        documentName,

        documentReference:
        documentReference

    };


    console.log(
        "Sending document request body:",
        data
    );


    try {

        await request(
            `${API}/contracts/${contractId}/documents`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(data)
            }
        );


        alert(
            "Document added successfully."
        );


        clearDocumentForm();

        await loadDocuments();

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}


async function loadDocuments() {

    const contractId =
        document.getElementById(
            "documentContract"
        ).value;


    const tbody =
        document.getElementById(
            "documentTableBody"
        );


    tbody.innerHTML = "";


    if (!contractId) {

        return;
    }


    try {

        const documents =
            await request(
                `${API}/contracts/${contractId}/documents`
            );


        if (!documents.length) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty">
                        No documents found.
                    </td>
                </tr>
            `;

            return;
        }


        documents.forEach(document => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>${document.id}</td>

                <td>
                    ${escapeHtml(
                document.documentName
            )}
                </td>

                <td>
                    ${escapeHtml(
                document.documentReference
            )}
                </td>

                <td>
                    ${document.addedDate || "-"}
                </td>

            `;


            tbody.appendChild(row);

        });

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}


function clearDocumentForm() {

    document.getElementById(
        "documentContract"
    ).value = "";


    document.getElementById(
        "documentName"
    ).value = "";


    document.getElementById(
        "documentReference"
    ).value = "";


    document.getElementById(
        "documentTableBody"
    ).innerHTML = "";

}


/* =========================================================
   REPORTS
   ========================================================= */

async function loadReport() {

    try {

        const report =
            await request(
                `${API}/reports/summary`
            );


        /*
         * Dashboard
         */

        document.getElementById(
            "totalContracts"
        ).textContent =
            report.totalContracts || 0;


        document.getElementById(
            "activeContracts"
        ).textContent =
            report.activeContracts || 0;


        document.getElementById(
            "renewalContracts"
        ).textContent =
            report.renewalReviewContracts || 0;


        document.getElementById(
            "terminatedContracts"
        ).textContent =
            report.terminatedContracts || 0;


        /*
         * Reports
         */

        document.getElementById(
            "reportTotal"
        ).textContent =
            report.totalContracts || 0;


        document.getElementById(
            "reportActive"
        ).textContent =
            report.activeContracts || 0;


        document.getElementById(
            "reportReview"
        ).textContent =
            report.renewalReviewContracts || 0;


        document.getElementById(
            "reportTerminated"
        ).textContent =
            report.terminatedContracts || 0;


        document.getElementById(
            "reportExpiring"
        ).textContent =
            report.expiringIn30Days || 0;

    } catch (error) {

        console.error(error);

        /*
         * Don't show an annoying alert every time
         * the dashboard initially loads if backend
         * is still starting.
         */

        console.error(
            "Could not load report:",
            error.message
        );

    }

}


/* =========================================================
   HTML SAFETY
   ========================================================= */

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }


    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");
}