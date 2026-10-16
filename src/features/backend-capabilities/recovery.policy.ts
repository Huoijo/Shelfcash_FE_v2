// Generated from hash-pinned contracts/020/recovery_journal.json. Do not edit.
export const recoveryRules = [
  {
    "operation": "T03",
    "phase": null,
    "mode": "full_body",
    "fields": [
      "name",
      "timezone",
      "currency"
    ],
    "conditions": {}
  },
  {
    "operation": "I01",
    "phase": null,
    "mode": "full_body",
    "fields": [
      "data_date"
    ],
    "conditions": {}
  },
  {
    "operation": "I02",
    "phase": null,
    "mode": "excluded",
    "fields": [],
    "conditions": {}
  },
  {
    "operation": "I03",
    "phase": null,
    "mode": "full_body",
    "fields": [
      "file_set_version",
      "accepted_file_ids",
      "acknowledged_rejected_client_file_ids"
    ],
    "conditions": {}
  },
  {
    "operation": "I05",
    "phase": "preview",
    "mode": "full_body",
    "fields": [
      "phase",
      "mapping_revision"
    ],
    "conditions": {}
  },
  {
    "operation": "I05",
    "phase": "confirm_review",
    "mode": "metadata_only",
    "fields": [
      "phase",
      "preview_id",
      "preview_digest",
      "mapping_revision",
      "confirm"
    ],
    "conditions": {}
  },
  {
    "operation": "I05",
    "phase": "commit",
    "mode": "conditional_full_body",
    "fields": [
      "phase",
      "preview_id",
      "preview_digest",
      "confirm",
      "reason",
      "resolutions",
      "supplier_changes",
      "history_corrections"
    ],
    "conditions": {
      "reason": "ABSENT or null ONLY",
      "resolutions": "exact empty array ONLY",
      "supplier_changes": "ABSENT or exact empty array ONLY",
      "history_corrections": "ABSENT or exact empty array ONLY"
    }
  },
  {
    "operation": "N13",
    "phase": null,
    "mode": "metadata_only",
    "fields": [
      "grants"
    ],
    "conditions": {}
  },
  {
    "operation": "N15",
    "phase": null,
    "mode": "excluded",
    "fields": [],
    "conditions": {}
  },
  {
    "operation": "N17",
    "phase": null,
    "mode": "metadata_only",
    "fields": [],
    "conditions": {}
  },
  {
    "operation": "N19",
    "phase": null,
    "mode": "excluded",
    "fields": [],
    "conditions": {}
  },
  {
    "operation": "IN01",
    "phase": null,
    "mode": "excluded",
    "fields": [],
    "conditions": {}
  },
  {
    "operation": "PR01",
    "phase": null,
    "mode": "metadata_only",
    "fields": [
      "requested_permissions",
      "permission_catalog_version",
      "expected_grants_version"
    ],
    "conditions": {}
  },
  {
    "operation": "PR04",
    "phase": null,
    "mode": "metadata_only",
    "fields": [],
    "conditions": {}
  },
  {
    "operation": "MQ01",
    "phase": null,
    "mode": "metadata_only",
    "fields": [],
    "conditions": {}
  },
  {
    "operation": "N5",
    "phase": null,
    "mode": "metadata_only",
    "fields": [],
    "conditions": {}
  },
  {
    "operation": "M04",
    "phase": null,
    "mode": "metadata_only",
    "fields": [],
    "conditions": {}
  },
  {
    "operation": "N6",
    "phase": null,
    "mode": "metadata_only",
    "fields": [],
    "conditions": {}
  },
  {
    "operation": "N1",
    "phase": null,
    "mode": "metadata_only",
    "fields": [],
    "conditions": {}
  },
  {
    "operation": "N3",
    "phase": null,
    "mode": "metadata_only",
    "fields": [],
    "conditions": {}
  },
  {
    "operation": "N4",
    "phase": null,
    "mode": "full_body",
    "fields": [
      "amount"
    ],
    "conditions": {
      "CAS": "exactly one If-Match or If-None-Match:*"
    }
  },
  {
    "operation": "N21",
    "phase": "preview",
    "mode": "metadata_only",
    "fields": [],
    "conditions": {}
  },
  {
    "operation": "N21",
    "phase": "commit",
    "mode": "full_body",
    "fields": [
      "phase",
      "change_id",
      "preview_digest",
      "confirm",
      "acknowledged_warning_codes"
    ],
    "conditions": {}
  },
  {
    "operation": "C02",
    "phase": null,
    "mode": "conditional_full_body",
    "fields": [
      "requirements_mode",
      "forecast_start_date",
      "default_requirements_version",
      "requirements",
      "saved_requirement_id"
    ],
    "conditions": {
      "requirements_mode": "default or saved ONLY",
      "requirements": "ABSENT or null ONLY"
    }
  },
  {
    "operation": "N10",
    "phase": null,
    "mode": "full_body",
    "fields": [
      "format",
      "option_id",
      "locale"
    ],
    "conditions": {}
  },
  {
    "operation": "NF03",
    "phase": null,
    "mode": "full_body",
    "fields": [
      "read"
    ],
    "conditions": {}
  },
  {
    "operation": "AS01",
    "phase": null,
    "mode": "full_body",
    "fields": [
      "expected_evidence_version",
      "option_id",
      "locale",
      "detail_level"
    ],
    "conditions": {}
  },
  {
    "operation": "AS03",
    "phase": null,
    "mode": "metadata_only",
    "fields": [],
    "conditions": {}
  }
] as const
