
export enum ScreenIds
{
    VendorList = 1,
    POList = 2,
    GRPO = 3,
    CustList = 4,
    SOList = 5,
    Delivery = 6,
    WH_BIN_Transfer = 7,
    ITRList = 8,
    ITROperationScreen = 9,
    ProdIssue_Orderlist = 10,
    ProdIssueScreen = 11,
    ProdRec_Orderlist = 12,
    ProdRecScreen = 13
}

export enum ModuleIds
{
    POReceipt = 1,
    AP_Invoice = 2,
    SO_Delivery = 3,
    SHP_Delivery = 4,
    WH_BIN_Transfer = 5,
    IT_By_ITR = 6,
    ProdIssue = 7,
    ProdReceipt = 8
}

export enum ControlIds {
    POList_GRID1 = "GRID_ITEM_QTY_DETAIL",
    GRPO_GRID1 = "GRID_GRPO_ITEM_DETAIL",
    GRPO_GRID2 = "GRID_BTCHSER_QTY",
    SOList_GRID1 = "GRID_PICKITEM_QTY_DETAIL",
    ITRList_GRID1 = "GRID_ITRLIST_ITEM_DETAIL",
    DEL_GRID1 = "GRID_DEL_ITEM_DETAIL",
    DEL_GRID2 = "GRID_PICKED_BTCHSER_QTY",
    WH_BIN_View_Items_GRID = "GRID_VIEW_ITEMS",
    PRODISSUE_GRID1 = "GRID_PRODISSUE_ORDERLIST",
    PRODISSUE_GRID2 = "GRID_PRODISSUE_BTCHSER",
    PRODREC_GRID1 = "GRID_PRODREC_ORDERLIST",
    PRODREC_GRID2 = "GRID_PRODREC_BTCHSER",
    ITROPR_GRID1 = "GRID_ITROPR_ITEM_DETAIL",
    ITROPR_GRID2 = "GRID_ITROPR__DETAIL",
}

export  enum ModuleName {
    Purchase = 1,
    Sales = 2,
    SalesOrder = 4
}

export enum ComponentName {
    // Purchase
    AddInquery = 101,
    UpdateInquery = 102,
    AddInqueryItem=103,
    

    // Sales Quotations
    UpdateSales=201,

    // Sales Order
    SalesOrderDetail = 401


    
}


export enum CustomerEntityType
{
/// <summary>
/// Customer Type entity.
/// </summary>
Customer = 1,

/// <summary>
/// Purchase Inquiry type.
/// </summary>
PurchaseInquiry = 2,

/// <summary>
/// Purchase Inquiry Item type.
/// </summary>
PurchaseInquiryItem = 3,

SalesQuotation = 4,

SalesOrder = 5

}


export enum EntityType
{
/// <summary>
/// Tenanat Type entity.
/// </summary>
Tenant = 1,
/// <summary>
/// User Type entity.
/// </summary>
User = 2,
/// <summary>
/// NotificationQueue Type entity.
/// </summary>
NotificationQueue = 3,

/// <summary>
/// Contact Type entity.
/// </summary>
Contact = 4,

/// <summary>
/// Note Type Entity
/// </summary>
Note = 5,

/// <summary>
/// Note Linking Type Entity
/// </summary>
NoteLinking = 6,

/// <summary>
/// Attachment Linking Type Entity
/// </summary>
AttachmentLinking = 7,

/// <summary>
/// Attachment Type Entity
/// </summary>
Attachment = 8
}

export enum NoteType
{
/// <summary>
/// No operatoin is performed.
/// </summary>
None = 0,
/// <summary>
/// Enum to represent Normal Note.
/// </summary>
Normal = 1,
/// <summary>
/// Enum to represent Rejected Note.
/// </summary>
Rejected = 2,
/// <summary>
/// Enum to represent Partially accepted note
/// </summary>
PartialApproved = 3
}

export enum PurchaseInquiryStatus
{

Draft = 1,
New = 2,
Revised = 3,
Approved = 4,
PartialApproved = 5,
Rejected = 6,
Cancelled = 7,
Closed = 8,
Updated = 9
}

