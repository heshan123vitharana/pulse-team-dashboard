import React from "react";

// Local storage keys
const MOCK_CATEGORIES_KEY = "cams_mock_categories";
const MOCK_TYPES_KEY = "cams_mock_types";
const MOCK_SUBTYPES_KEY = "cams_mock_subtypes";
const MOCK_BASKET_TYPES_KEY = "cams_mock_basket_types";
const MOCK_CLASS_ROOMS_KEY = "cams_mock_class_rooms";
const MOCK_RESOURCE_PERSON_TYPES_KEY = "cams_mock_resource_person_types";
const MOCK_SERVICES_KEY = "cams_mock_services";
const MOCK_EDUCATIONAL_QUALIFICATION_LEVELS_KEY = "cams_mock_educational_qualification_levels";
const MOCK_MODULE_GROUPS_KEY = "cams_mock_module_groups";
const MOCK_SUBJECT_AREAS_KEY = "cams_mock_subject_areas";

// Toggle to control mock mode. Set to true for local testing, false for real staging API.
export const USE_MOCK_DATA = false;

// Initial premium seed data
const INITIAL_CATEGORIES = [
    { name: "cat-1", category_name: "Fee Levying", is_active: 1, creation: "2026-05-18 12:00:00", modified: "2026-05-18 12:00:00" },
    { name: "cat-2", category_name: "Non Fee Levying", is_active: 1, creation: "2026-05-18 12:01:00", modified: "2026-05-18 12:01:00" },
];

const INITIAL_TYPES = [
    { name: "type-1", type_name: "Diploma", parent_category: "cat-1", is_active: 1, creation: "2026-05-18 12:02:00", modified: "2026-05-18 12:02:00" },
    { name: "type-2", type_name: "Certificate Course", parent_category: "cat-1", is_active: 1, creation: "2026-05-18 12:03:00", modified: "2026-05-18 12:03:00" },
    { name: "type-3", type_name: "Training Consultancy - Without Module", parent_category: "cat-2", is_active: 1, creation: "2026-05-18 12:04:00", modified: "2026-05-18 12:04:00" },
];

const INITIAL_SUBTYPES = [
    { name: "subtype-1", subtype_name: "Postgraduate Diploma", parent_type: "type-1", is_active: 1, creation: "2026-05-18 12:05:00", modified: "2026-05-18 12:05:00" },
    { name: "subtype-2", subtype_name: "Advanced Certificate", parent_type: "type-2", is_active: 1, creation: "2026-05-18 12:06:00", modified: "2026-05-18 12:06:00" },
];

const INITIAL_BASKET_TYPES = [
    { name: "basket-1", basket_type_name: "Professional Qualifications", is_active: 1, creation: "2026-05-18 12:00:00", modified: "2026-05-18 12:00:00" },
    { name: "basket-2", basket_type_name: "Diploma", is_active: 1, creation: "2026-05-18 12:01:00", modified: "2026-05-18 12:01:00" },
    { name: "basket-3", basket_type_name: "Short Course", is_active: 1, creation: "2026-05-18 12:02:00", modified: "2026-05-18 12:02:00" },
];

const INITIAL_CLASS_ROOMS = [
    { name: "room-1", room_name: "Sanbhava Hall", capacity: 50, location: "Main Building, 2nd Floor", amenities: "<p>Projector, AC, Whiteboard, Sound System</p>", is_active: 1, creation: "2026-05-18 12:00:00", modified: "2026-05-18 12:00:00" },
    { name: "room-2", room_name: "Computer Lab 02", capacity: 30, location: "IT Block, Ground Floor", amenities: "<p>30 High-end PCs, AC, Projector</p>", is_active: 1, creation: "2026-05-18 12:01:00", modified: "2026-05-18 12:01:00" },
];

const INITIAL_RESOURCE_PERSON_TYPES = [
    { name: "rpt-1", type_name: "Internal", is_active: 1, creation: "2026-05-18 12:00:00", modified: "2026-05-18 12:00:00" },
    { name: "rpt-2", type_name: "External", is_active: 1, creation: "2026-05-18 12:01:00", modified: "2026-05-18 12:01:00" },
    { name: "rpt-3", type_name: "Visiting Lecturer", is_active: 1, creation: "2026-05-18 12:02:00", modified: "2026-05-18 12:02:00" },
];

const INITIAL_SERVICES = [
    { name: "srv-1", service_name: "Class I", is_active: 1, creation: "2026-05-18 12:00:00", modified: "2026-05-18 12:00:00" },
    { name: "srv-2", service_name: "Class II", is_active: 1, creation: "2026-05-18 12:01:00", modified: "2026-05-18 12:01:00" },
    { name: "srv-3", service_name: "Class III", is_active: 1, creation: "2026-05-18 12:02:00", modified: "2026-05-18 12:02:00" },
];

const INITIAL_EDUCATIONAL_QUALIFICATION_LEVELS = [
    { name: "eql-1", level_name: "Diploma", is_active: 1, creation: "2026-05-18 12:00:00", modified: "2026-05-18 12:00:00" },
    { name: "eql-2", level_name: "Bachelor's", is_active: 1, creation: "2026-05-18 12:01:00", modified: "2026-05-18 12:01:00" },
    { name: "eql-3", level_name: "Master's", is_active: 1, creation: "2026-05-18 12:02:00", modified: "2026-05-18 12:02:00" },
    { name: "eql-4", level_name: "PhD", is_active: 1, creation: "2026-05-18 12:03:00", modified: "2026-05-18 12:03:00" },
];

const INITIAL_MODULE_GROUPS = [
    { name: "mg-1", group_name: "Core Modules", is_active: 1, creation: "2026-05-18 12:00:00", modified: "2026-05-18 12:00:00" },
    { name: "mg-2", group_name: "Elective Modules", is_active: 1, creation: "2026-05-18 12:01:00", modified: "2026-05-18 12:01:00" },
    { name: "mg-3", group_name: "Foundation Modules", is_active: 1, creation: "2026-05-18 12:02:00", modified: "2026-05-18 12:02:00" },
];

const INITIAL_SUBJECT_AREAS = [
    { name: "sa-1", area_name: "HR Development", is_active: 1, creation: "2026-05-18 12:00:00", modified: "2026-05-18 12:00:00" },
    { name: "sa-2", area_name: "Financial Analysis", is_active: 1, creation: "2026-05-18 12:01:00", modified: "2026-05-18 12:01:00" },
    { name: "sa-3", area_name: "Procurement", is_active: 1, creation: "2026-05-18 12:02:00", modified: "2026-05-18 12:02:00" },
];

// Helper to load / save
const loadDb = (key: string, initial: any[]) => {
    const raw = localStorage.getItem(key);
    if (!raw || raw === "[]") {
        localStorage.setItem(key, JSON.stringify(initial));
        return initial;
    }
    return JSON.parse(raw);
};

const saveDb = (key: string, data: any[]) => {
    localStorage.setItem(key, JSON.stringify(data));
    // Trigger global event for invalidation updates
    window.dispatchEvent(new Event("cams-cache-invalidate"));
};

// Global invalidation trigger
export const triggerMockInvalidation = () => {
    window.dispatchEvent(new Event("cams-cache-invalidate"));
};

export const useMockGetCall = (method: string, args: any) => {
    const [version, setVersion] = React.useState(0);

    React.useEffect(() => {
        const handler = () => setVersion((v) => v + 1);
        window.addEventListener("cams-cache-invalidate", handler);
        return () => window.removeEventListener("cams-cache-invalidate", handler);
    }, []);

    // Load datasets
    const categories = loadDb(MOCK_CATEGORIES_KEY, INITIAL_CATEGORIES);
    const types = loadDb(MOCK_TYPES_KEY, INITIAL_TYPES);
    const subtypes = loadDb(MOCK_SUBTYPES_KEY, INITIAL_SUBTYPES);
    const basketTypes = loadDb(MOCK_BASKET_TYPES_KEY, INITIAL_BASKET_TYPES);
    const classRooms = loadDb(MOCK_CLASS_ROOMS_KEY, INITIAL_CLASS_ROOMS);
    const resourcePersonTypes = loadDb(MOCK_RESOURCE_PERSON_TYPES_KEY, INITIAL_RESOURCE_PERSON_TYPES);
    const services = loadDb(MOCK_SERVICES_KEY, INITIAL_SERVICES);
    const educationalQualificationLevels = loadDb(MOCK_EDUCATIONAL_QUALIFICATION_LEVELS_KEY, INITIAL_EDUCATIONAL_QUALIFICATION_LEVELS);
    const moduleGroups = loadDb(MOCK_MODULE_GROUPS_KEY, INITIAL_MODULE_GROUPS);
    const subjectAreas = loadDb(MOCK_SUBJECT_AREAS_KEY, INITIAL_SUBJECT_AREAS);

    let result: any[] = [];

    // Category lists
    if (method.includes("program_category.get_list") || (args?.doctype === "Program Category")) {
        result = categories.map((cat: any) => ({ ...cat }));
    }
    // Type lists
    else if (method.includes("program_type.get_list") || (args?.doctype === "Program Type")) {
        result = types.map((type: any) => {
            const parentCat = categories.find((c: any) => c.name === type.parent_category);
            return {
                ...type,
                category_name: parentCat ? parentCat.category_name : "",
            };
        });
    }
    // Subtype lists
    else if (method.includes("program_subtype.get_list") || (args?.doctype === "Program Subtype")) {
        result = subtypes.map((sub: any) => {
            const parentType = types.find((t: any) => t.name === sub.parent_type);
            return {
                ...sub,
                type_name: parentType ? parentType.type_name : "",
            };
        });
    }
    // Module Basket Type lists
    else if (method.includes("module_basket_type.get_list") || (args?.doctype === "Module Basket Type")) {
        result = basketTypes.map((item: any) => ({ ...item }));
    }
    // Class Room lists
    else if (method.includes("class_room.get_list") || (args?.doctype === "Class Room")) {
        result = classRooms.map((item: any) => ({ ...item }));
    }
    // Resource Person Type lists
    else if (method.includes("resource_person_type.get_list") || (args?.doctype === "Resource Person Type")) {
        result = resourcePersonTypes.map((item: any) => ({ ...item }));
    }
    // Service lists
    else if (method.includes("service.get_list") || (args?.doctype === "Service")) {
        result = services.map((item: any) => ({ ...item }));
    }
    // Educational Qualification Level lists
    else if (method.includes("educational_qualification_level.get_list") || (args?.doctype === "Educational Qualification Level")) {
        result = educationalQualificationLevels.map((item: any) => ({ ...item }));
    }
    // Module Group lists
    else if (method.includes("module_group.get_list") || (args?.doctype === "Module Group")) {
        result = moduleGroups.map((item: any) => ({ ...item }));
    }
    // Subject Area lists
    else if (method.includes("subject_area.get_list") || (args?.doctype === "Subject Area")) {
        result = subjectAreas.map((item: any) => ({ ...item }));
    }

    // Apply filtering
    if (args?.filters) {
        // args.filters can be an array of arrays: [["field", "operator", "value"]]
        const filters = args.filters;
        if (Array.isArray(filters)) {
            filters.forEach(([field, op, val]: [string, string, any]) => {
                if (val === undefined || val === null || val === "") return;

                if (op === "like" && typeof val === "string") {
                    const cleanVal = val.replace(/%/g, "").toLowerCase();
                    result = result.filter((row) =>
                        String(row[field] || "").toLowerCase().includes(cleanVal)
                    );
                } else if (op === "=") {
                    result = result.filter((row) => String(row[field]) === String(val));
                }
            });
        }
    }

    // Sort by modified desc as default
    result.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());

    const count = result.length;

    // Paginate mock data
    const start = args?.start || 0;
    const pageLength = args?.page_length || 15;
    const paginatedResult = result.slice(start, start + pageLength);

    const finalResult = paginatedResult.map((row) => ({
        ...row,
        __count: count,
    }));

    // Fake loading delay simulation
    return {
        data: { message: finalResult },
        isLoading: false,
        isValidating: false,
    };
};

export const useMockPostCall = (method: string) => {
    const [loading, setLoading] = React.useState(false);

    const call = React.useCallback(async (payload: any) => {
        setLoading(true);
        // Simulate network latency
        await new Promise((r) => setTimeout(r, 400));

        const categories = loadDb(MOCK_CATEGORIES_KEY, INITIAL_CATEGORIES);
        const types = loadDb(MOCK_TYPES_KEY, INITIAL_TYPES);
        const subtypes = loadDb(MOCK_SUBTYPES_KEY, INITIAL_SUBTYPES);
        const basketTypes = loadDb(MOCK_BASKET_TYPES_KEY, INITIAL_BASKET_TYPES);
        const classRooms = loadDb(MOCK_CLASS_ROOMS_KEY, INITIAL_CLASS_ROOMS);
        const resourcePersonTypes = loadDb(MOCK_RESOURCE_PERSON_TYPES_KEY, INITIAL_RESOURCE_PERSON_TYPES);
        const services = loadDb(MOCK_SERVICES_KEY, INITIAL_SERVICES);
        const educationalQualificationLevels = loadDb(MOCK_EDUCATIONAL_QUALIFICATION_LEVELS_KEY, INITIAL_EDUCATIONAL_QUALIFICATION_LEVELS);
        const moduleGroups = loadDb(MOCK_MODULE_GROUPS_KEY, INITIAL_MODULE_GROUPS);
        const subjectAreas = loadDb(MOCK_SUBJECT_AREAS_KEY, INITIAL_SUBJECT_AREAS);

        const now = new Date().toISOString().replace("T", " ").substring(0, 19);

        // CREATE OR UPDATE CATEGORY
        if (method.includes("program_category")) {
            if (method.includes("create")) {
                const newRecord = {
                    name: `cat-${Date.now()}`,
                    category_name: payload.category_name,
                    is_active: payload.is_active ?? 1,
                    creation: now,
                    modified: now,
                };
                // Check uniqueness
                if (categories.some((c: any) => c.category_name.toLowerCase() === payload.category_name.toLowerCase())) {
                    setLoading(false);
                    throw new Error("Program Category Name must be unique");
                }
                categories.push(newRecord);
                saveDb(MOCK_CATEGORIES_KEY, categories);
            } else if (method.includes("update")) {
                const idx = categories.findIndex((c: any) => c.name === payload.name);
                if (idx !== -1) {
                    // Check uniqueness for other categories
                    if (categories.some((c: any) => c.name !== payload.name && c.category_name.toLowerCase() === payload.category_name.toLowerCase())) {
                        setLoading(false);
                        throw new Error("Program Category Name must be unique");
                    }
                    categories[idx] = {
                        ...categories[idx],
                        category_name: payload.category_name,
                        is_active: payload.is_active,
                        modified: now,
                    };
                    saveDb(MOCK_CATEGORIES_KEY, categories);
                }
            }
        }
        // CREATE OR UPDATE TYPE
        else if (method.includes("program_type")) {
            if (method.includes("create")) {
                const newRecord = {
                    name: `type-${Date.now()}`,
                    type_name: payload.type_name,
                    parent_category: payload.parent_category,
                    is_active: payload.is_active ?? 1,
                    creation: now,
                    modified: now,
                };
                if (types.some((t: any) => t.type_name.toLowerCase() === payload.type_name.toLowerCase())) {
                    setLoading(false);
                    throw new Error("Program Type Name must be unique");
                }
                types.push(newRecord);
                saveDb(MOCK_TYPES_KEY, types);
            } else if (method.includes("update")) {
                const idx = types.findIndex((t: any) => t.name === payload.name);
                if (idx !== -1) {
                    if (types.some((t: any) => t.name !== payload.name && t.type_name.toLowerCase() === payload.type_name.toLowerCase())) {
                        setLoading(false);
                        throw new Error("Program Type Name must be unique");
                    }
                    types[idx] = {
                        ...types[idx],
                        type_name: payload.type_name,
                        parent_category: payload.parent_category,
                        is_active: payload.is_active,
                        modified: now,
                    };
                    saveDb(MOCK_TYPES_KEY, types);
                }
            }
        }
        // CREATE OR UPDATE SUBTYPE
        else if (method.includes("program_subtype")) {
            if (method.includes("create")) {
                const newRecord = {
                    name: `subtype-${Date.now()}`,
                    subtype_name: payload.subtype_name,
                    parent_type: payload.parent_type,
                    is_active: payload.is_active ?? 1,
                    creation: now,
                    modified: now,
                };
                if (subtypes.some((s: any) => s.subtype_name.toLowerCase() === payload.subtype_name.toLowerCase())) {
                    setLoading(false);
                    throw new Error("Program Subtype Name must be unique");
                }
                subtypes.push(newRecord);
                saveDb(MOCK_SUBTYPES_KEY, subtypes);
            } else if (method.includes("update")) {
                const idx = subtypes.findIndex((s: any) => s.name === payload.name);
                if (idx !== -1) {
                    if (subtypes.some((s: any) => s.name !== payload.name && s.subtype_name.toLowerCase() === payload.subtype_name.toLowerCase())) {
                        setLoading(false);
                        throw new Error("Program Subtype Name must be unique");
                    }
                    subtypes[idx] = {
                        ...subtypes[idx],
                        subtype_name: payload.subtype_name,
                        parent_type: payload.parent_type,
                        is_active: payload.is_active,
                        modified: now,
                    };
                    saveDb(MOCK_SUBTYPES_KEY, subtypes);
                }
            }
        }
        // CREATE OR UPDATE MODULE BASKET TYPE
        else if (method.includes("module_basket_type")) {
            if (method.includes("create")) {
                const newRecord = {
                    name: `basket-${Date.now()}`,
                    basket_type_name: payload.basket_type_name,
                    is_active: payload.is_active ?? 1,
                    creation: now,
                    modified: now,
                };
                if (basketTypes.some((b: any) => b.basket_type_name.toLowerCase() === payload.basket_type_name.toLowerCase())) {
                    setLoading(false);
                    throw new Error("Module Basket Type Name must be unique");
                }
                basketTypes.push(newRecord);
                saveDb(MOCK_BASKET_TYPES_KEY, basketTypes);
            } else if (method.includes("update")) {
                const idx = basketTypes.findIndex((b: any) => b.name === payload.name);
                if (idx !== -1) {
                    if (basketTypes.some((b: any) => b.name !== payload.name && b.basket_type_name.toLowerCase() === payload.basket_type_name.toLowerCase())) {
                        setLoading(false);
                        throw new Error("Module Basket Type Name must be unique");
                    }
                    basketTypes[idx] = {
                        ...basketTypes[idx],
                        basket_type_name: payload.basket_type_name,
                        is_active: payload.is_active,
                        modified: now,
                    };
                    saveDb(MOCK_BASKET_TYPES_KEY, basketTypes);
                }
            }
        }
        // CREATE OR UPDATE CLASS ROOM
        else if (method.includes("class_room")) {
            if (method.includes("create")) {
                const newRecord = {
                    name: `room-${Date.now()}`,
                    room_name: payload.room_name,
                    capacity: payload.capacity,
                    location: payload.location,
                    amenities: payload.amenities,
                    is_active: payload.is_active ?? 1,
                    creation: now,
                    modified: now,
                };
                if (classRooms.some((r: any) => r.room_name.toLowerCase() === payload.room_name.toLowerCase())) {
                    setLoading(false);
                    throw new Error("Class Room Name must be unique");
                }
                classRooms.push(newRecord);
                saveDb(MOCK_CLASS_ROOMS_KEY, classRooms);
            } else if (method.includes("update")) {
                const idx = classRooms.findIndex((r: any) => r.name === payload.name);
                if (idx !== -1) {
                    if (classRooms.some((r: any) => r.name !== payload.name && r.room_name.toLowerCase() === payload.room_name.toLowerCase())) {
                        setLoading(false);
                        throw new Error("Class Room Name must be unique");
                    }
                    classRooms[idx] = {
                        ...classRooms[idx],
                        room_name: payload.room_name,
                        capacity: payload.capacity,
                        location: payload.location,
                        amenities: payload.amenities,
                        is_active: payload.is_active,
                        modified: now,
                    };
                    saveDb(MOCK_CLASS_ROOMS_KEY, classRooms);
                }
            }
        }
        // CREATE OR UPDATE RESOURCE PERSON TYPE
        else if (method.includes("resource_person_type")) {
            if (method.includes("create")) {
                const newRecord = {
                    name: `rpt-${Date.now()}`,
                    type_name: payload.type_name,
                    is_active: payload.is_active ?? 1,
                    creation: now,
                    modified: now,
                };
                if (resourcePersonTypes.some((r: any) => r.type_name.toLowerCase() === payload.type_name.toLowerCase())) {
                    setLoading(false);
                    throw new Error("Resource Person Type Name must be unique");
                }
                resourcePersonTypes.push(newRecord);
                saveDb(MOCK_RESOURCE_PERSON_TYPES_KEY, resourcePersonTypes);
            } else if (method.includes("update")) {
                const idx = resourcePersonTypes.findIndex((r: any) => r.name === payload.name);
                if (idx !== -1) {
                    if (resourcePersonTypes.some((r: any) => r.name !== payload.name && r.type_name.toLowerCase() === payload.type_name.toLowerCase())) {
                        setLoading(false);
                        throw new Error("Resource Person Type Name must be unique");
                    }
                    resourcePersonTypes[idx] = {
                        ...resourcePersonTypes[idx],
                        type_name: payload.type_name,
                        is_active: payload.is_active,
                        modified: now,
                    };
                    saveDb(MOCK_RESOURCE_PERSON_TYPES_KEY, resourcePersonTypes);
                }
            }
        }
        // CREATE OR UPDATE SERVICE
        else if (method.includes("service")) {
            if (method.includes("create")) {
                const newRecord = {
                    name: `srv-${Date.now()}`,
                    service_name: payload.service_name,
                    is_active: payload.is_active ?? 1,
                    creation: now,
                    modified: now,
                };
                if (services.some((s: any) => s.service_name.toLowerCase() === payload.service_name.toLowerCase())) {
                    setLoading(false);
                    throw new Error("Service Name must be unique");
                }
                services.push(newRecord);
                saveDb(MOCK_SERVICES_KEY, services);
            } else if (method.includes("update")) {
                const idx = services.findIndex((s: any) => s.name === payload.name);
                if (idx !== -1) {
                    if (services.some((s: any) => s.name !== payload.name && s.service_name.toLowerCase() === payload.service_name.toLowerCase())) {
                        setLoading(false);
                        throw new Error("Service Name must be unique");
                    }
                    services[idx] = {
                        ...services[idx],
                        service_name: payload.service_name,
                        is_active: payload.is_active,
                        modified: now,
                    };
                    saveDb(MOCK_SERVICES_KEY, services);
                }
            }
        }
        // CREATE OR UPDATE EDUCATIONAL QUALIFICATION LEVEL
        else if (method.includes("educational_qualification_level")) {
            if (method.includes("create")) {
                const newRecord = {
                    name: `eql-${Date.now()}`,
                    level_name: payload.level_name,
                    is_active: payload.is_active ?? 1,
                    creation: now,
                    modified: now,
                };
                if (educationalQualificationLevels.some((e: any) => e.level_name.toLowerCase() === payload.level_name.toLowerCase())) {
                    setLoading(false);
                    throw new Error("Educational Qualification Level must be unique");
                }
                educationalQualificationLevels.push(newRecord);
                saveDb(MOCK_EDUCATIONAL_QUALIFICATION_LEVELS_KEY, educationalQualificationLevels);
            } else if (method.includes("update")) {
                const idx = educationalQualificationLevels.findIndex((e: any) => e.name === payload.name);
                if (idx !== -1) {
                    if (educationalQualificationLevels.some((e: any) => e.name !== payload.name && e.level_name.toLowerCase() === payload.level_name.toLowerCase())) {
                        setLoading(false);
                        throw new Error("Educational Qualification Level must be unique");
                    }
                    educationalQualificationLevels[idx] = {
                        ...educationalQualificationLevels[idx],
                        level_name: payload.level_name,
                        is_active: payload.is_active,
                        modified: now,
                    };
                    saveDb(MOCK_EDUCATIONAL_QUALIFICATION_LEVELS_KEY, educationalQualificationLevels);
                }
            }
        }
        // CREATE OR UPDATE MODULE GROUP
        else if (method.includes("module_group")) {
            if (method.includes("create")) {
                const newRecord = {
                    name: `mg-${Date.now()}`,
                    group_name: payload.group_name,
                    is_active: payload.is_active ?? 1,
                    creation: now,
                    modified: now,
                };
                if (moduleGroups.some((m: any) => m.group_name.toLowerCase() === payload.group_name.toLowerCase())) {
                    setLoading(false);
                    throw new Error("Module Group Name must be unique");
                }
                moduleGroups.push(newRecord);
                saveDb(MOCK_MODULE_GROUPS_KEY, moduleGroups);
            } else if (method.includes("update")) {
                const idx = moduleGroups.findIndex((m: any) => m.name === payload.name);
                if (idx !== -1) {
                    if (moduleGroups.some((m: any) => m.name !== payload.name && m.group_name.toLowerCase() === payload.group_name.toLowerCase())) {
                        setLoading(false);
                        throw new Error("Module Group Name must be unique");
                    }
                    moduleGroups[idx] = {
                        ...moduleGroups[idx],
                        group_name: payload.group_name,
                        is_active: payload.is_active,
                        modified: now,
                    };
                    saveDb(MOCK_MODULE_GROUPS_KEY, moduleGroups);
                }
            }
        }
        // CREATE OR UPDATE SUBJECT AREA
        else if (method.includes("subject_area")) {
            if (method.includes("create")) {
                const newRecord = {
                    name: `sa-${Date.now()}`,
                    area_name: payload.area_name,
                    is_active: payload.is_active ?? 1,
                    creation: now,
                    modified: now,
                };
                if (subjectAreas.some((s: any) => s.area_name.toLowerCase() === payload.area_name.toLowerCase())) {
                    setLoading(false);
                    throw new Error("Subject Area Name must be unique");
                }
                subjectAreas.push(newRecord);
                saveDb(MOCK_SUBJECT_AREAS_KEY, subjectAreas);
            } else if (method.includes("update")) {
                const idx = subjectAreas.findIndex((s: any) => s.name === payload.name);
                if (idx !== -1) {
                    if (subjectAreas.some((s: any) => s.name !== payload.name && s.area_name.toLowerCase() === payload.area_name.toLowerCase())) {
                        setLoading(false);
                        throw new Error("Subject Area Name must be unique");
                    }
                    subjectAreas[idx] = {
                        ...subjectAreas[idx],
                        area_name: payload.area_name,
                        is_active: payload.is_active,
                        modified: now,
                    };
                    saveDb(MOCK_SUBJECT_AREAS_KEY, subjectAreas);
                }
            }
        }

        setLoading(false);
        return { message: "Success" };
    }, [method]);

    return { call, loading };
};
