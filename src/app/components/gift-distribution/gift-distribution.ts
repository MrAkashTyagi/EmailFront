.gift-page {
  padding: 16px;
}

.page-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.page-toolbar-left {
  flex: 1;
}

.page-toolbar-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-wrapper {
  position: relative;
  max-width: 420px;
}

.search-input {
  width: 100%;
  height: 44px;
  border: 1px solid #dcdcdc;
  border-radius: 10px;
  padding-left: 42px;
  padding-right: 12px;
  font-size: 14px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 10px;
  color: gray;
}

.summary-cards {
  display: grid;
  gap: 16px;
  margin: 20px 0;
  grid-template-columns: repeat(
    auto-fit,
    minmax(220px, 1fr)
  );
}

.summary-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow:
    0 2px 10px rgba(0,0,0,.08);
}

.summary-card .value {
  font-size: 24px;
  font-weight: 700;
  color: #4f46e5;
}

.summary-card .label {
  margin-top: 4px;
  color: #6b7280;
}

.filters-card {
  padding: 16px;
}

.filter-grid {
  display: grid;
  gap: 16px;
  grid-template-columns:
    repeat(
      auto-fit,
      minmax(220px,1fr)
    );
}

.filter-actions {
  display: flex;
  align-items: center;
}

.table-section {
  overflow: auto;
  border-radius: 16px;
  background: white;
}

table {
  width: 100%;
}

.mat-mdc-header-row {
  background: #f8fafc;
}

.mat-mdc-header-cell {
  font-weight: 600;
}

.mat-column-actions {
  width: 120px;
}

.toolbar-add-btn {
  background: #4f46e5 !important;
  color: white !important;
}

.toolbar-filter-btn {
  border-radius: 8px;
}

.no-data {
  text-align: center;
  padding: 32px;
  color: #777;
}

@media (max-width: 768px) {

  .page-toolbar {
    flex-direction: column;
  }

  .page-toolbar-right {
    width: 100%;
    justify-content: space-between;
  }

}
.toolbar-export-btn {

  width: 44px;
  height: 44px;

  min-width: 44px;

  padding: 0;

  border: 1px solid #cbd5e1;
  border-radius: 10px;

  background: #ffffff;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  transition: all .2s ease;
}

.toolbar-export-btn:hover {

  border-color: #86efac;

  background: #f0fdf4;

  transform: translateY(-1px);

  box-shadow:
    0 5px 12px rgba(15, 23, 42, 0.14);
}

.toolbar-export-icon {

  width: 26px;
  height: 26px;

  object-fit: contain;

  display: block;
}
.envelope-summary-bar {

  margin-top: 18px;

  padding: 18px;

  border-radius: 18px;

  background: linear-gradient(
    135deg,
    #fff7ed,
    #fffbeb
  );

  border: 1px solid #fed7aa;
}

.envelope-summary-title {

  display: block;

  margin-bottom: 12px;

  color: #9a3412;

  font-weight: 700;
}

.envelope-summary-list {

  display: flex;

  flex-wrap: wrap;

  gap: 10px;

  align-items: center;
}

.envelope-chip {

  padding: 8px 14px;

  border-radius: 999px;

  background: #ffffff;

  border: 1px solid #fdba74;

  font-weight: 600;

  color: #9a3412;
}

.envelope-chip-count {

  margin-left: 6px;

  font-weight: 700;
}

.envelope-final-section {

  display: flex;

  gap: 10px;

  margin-left: auto;
}

.envelope-total-chip {

  padding: 8px 14px;

  border-radius: 999px;

  background: #ea580c;

  color: white;

  font-weight: 700;
}

.envelope-amount-chip {

  padding: 8px 14px;

  border-radius: 999px;

  background: #059669;

  color: white;

  font-weight: 700;
}
.toolbar-envelope-summary {

  display: flex;

  flex-wrap: wrap;

  align-items: center;

  gap: 8px;

  flex: 1;

  justify-content: center;

  min-width: 200px;
}

.toolbar-envelope-chip {

  padding: 6px 12px;

  border-radius: 999px;

  background: #fff7ed;

  border: 1px solid #fdba74;

  color: #9a3412;

  font-size: 13px;

  font-weight: 600;

  white-space: nowrap;
}

.toolbar-envelope-total {

  padding: 7px 14px;

  border-radius: 999px;

  background: #ea580c;

  color: white;

  font-size: 13px;

  font-weight: 700;

  white-space: nowrap;
}
