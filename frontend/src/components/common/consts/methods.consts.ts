export const AUTH_METHODS = {
  FORGOT_PASSWORD: "cams_v3.auth.reset_forgot_password",
  CHANGE_PASSWORD: "cams_v3.auth.update_current_password",
};

export const MASTER_DATA = {
  PROGRAM_CATEGORY: {
    LIST: "cams_v3.master_data.get_program_category_list",
    CREATE: "cams_v3.master_data.create_program_category",
    UPDATE: "cams_v3.master_data.update_program_category",
  },
  PROGRAM_TYPE: {
    LIST: "cams_v3.master_data.get_program_type_list",
    CATEGORY_DD: "cams_v3.master_data.get_program_category_list_for_dd",
    CREATE: "cams_v3.master_data.create_program_type",
    UPDATE: "cams_v3.master_data.update_program_type",
  },
  PROGRAM_SUBTYPE: {
    LIST: "cams_v3.master_data.get_program_subtype_list",
    TYPE_DD: "cams_v3.master_data.get_program_type_list_for_dd",
    CREATE: "cams_v3.master_data.create_program_subtype",
    UPDATE: "cams_v3.master_data.update_program_subtype",
  },
  MODULE_BASKET_TYPE: {
    LIST: "cams_v3.master_data.get_module_basket_type_list",
    CREATE: "cams_v3.master_data.create_module_basket_type",
    UPDATE: "cams_v3.master_data.update_module_basket_type",
  },
  CLASS_ROOM: {
    LIST: "cams_v3.master_data.get_class_room_list",
    CREATE: "cams_v3.master_data.create_class_room",
    UPDATE: "cams_v3.master_data.update_class_room",
  },
  RESOURCE_PERSON_TYPE: {
    LIST: "cams_v3.master_data.get_resource_person_type_list",
    CREATE: "cams_v3.master_data.create_resource_person_type",
    UPDATE: "cams_v3.master_data.update_resource_person_type",
  },
  SERVICE: {
    LIST: "cams_v3.master_data.get_service_list",
    CREATE: "cams_v3.master_data.create_service",
    UPDATE: "cams_v3.master_data.update_service",
  },
  EDUCATIONAL_QUALIFICATION_LEVEL: {
    LIST: "cams_v3.master_data.get_educational_qualification_level_list",
    CREATE: "cams_v3.master_data.create_educational_qualification_level",
    UPDATE: "cams_v3.master_data.update_educational_qualification_level",
  },
  MODULE_GROUP: {
    LIST: "cams_v3.master_data.get_module_group_list",
    CREATE: "cams_v3.master_data.create_module_group",
    UPDATE: "cams_v3.master_data.update_module_group",
  },
  SUBJECT_AREA: {
    LIST: "cams_v3.master_data.get_subject_area_list",
    CREATE: "cams_v3.master_data.create_subject_area",
    UPDATE: "cams_v3.master_data.update_subject_area",
  },
};

