type BaseType = {
    app: string
}

interface IProjectConfig {
    base: BaseType
}

export const PROJECT_CONFIG: IProjectConfig = {
    base: {
        app: "base-app"
    }
}