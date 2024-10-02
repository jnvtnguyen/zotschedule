/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from "./routes/__root";
import { Route as ScheduleImport } from "./routes/schedule";
import { Route as CoursesIndexImport } from "./routes/courses/index";
import { Route as CoursesCourseIdImport } from "./routes/courses/$courseId";
import { Route as AuthSignupImport } from "./routes/auth/signup";
import { Route as AuthLoginImport } from "./routes/auth/login";
import { Route as CoursesCourseIdPrerequisitesImport } from "./routes/courses/$courseId.prerequisites";
import { Route as CoursesCourseIdOfferingsImport } from "./routes/courses/$courseId.offerings";

// Create/Update Routes

const ScheduleRoute = ScheduleImport.update({
  path: "/schedule",
  getParentRoute: () => rootRoute,
} as any);

const CoursesIndexRoute = CoursesIndexImport.update({
  path: "/courses/",
  getParentRoute: () => rootRoute,
} as any);

const CoursesCourseIdRoute = CoursesCourseIdImport.update({
  path: "/courses/$courseId",
  getParentRoute: () => rootRoute,
} as any);

const AuthSignupRoute = AuthSignupImport.update({
  path: "/auth/signup",
  getParentRoute: () => rootRoute,
} as any);

const AuthLoginRoute = AuthLoginImport.update({
  path: "/auth/login",
  getParentRoute: () => rootRoute,
} as any);

const CoursesCourseIdPrerequisitesRoute =
  CoursesCourseIdPrerequisitesImport.update({
    path: "/prerequisites",
    getParentRoute: () => CoursesCourseIdRoute,
  } as any);

const CoursesCourseIdOfferingsRoute = CoursesCourseIdOfferingsImport.update({
  path: "/offerings",
  getParentRoute: () => CoursesCourseIdRoute,
} as any);

// Populate the FileRoutesByPath interface

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "/schedule": {
      id: "/schedule";
      path: "/schedule";
      fullPath: "/schedule";
      preLoaderRoute: typeof ScheduleImport;
      parentRoute: typeof rootRoute;
    };
    "/auth/login": {
      id: "/auth/login";
      path: "/auth/login";
      fullPath: "/auth/login";
      preLoaderRoute: typeof AuthLoginImport;
      parentRoute: typeof rootRoute;
    };
    "/auth/signup": {
      id: "/auth/signup";
      path: "/auth/signup";
      fullPath: "/auth/signup";
      preLoaderRoute: typeof AuthSignupImport;
      parentRoute: typeof rootRoute;
    };
    "/courses/$courseId": {
      id: "/courses/$courseId";
      path: "/courses/$courseId";
      fullPath: "/courses/$courseId";
      preLoaderRoute: typeof CoursesCourseIdImport;
      parentRoute: typeof rootRoute;
    };
    "/courses/": {
      id: "/courses/";
      path: "/courses";
      fullPath: "/courses";
      preLoaderRoute: typeof CoursesIndexImport;
      parentRoute: typeof rootRoute;
    };
    "/courses/$courseId/offerings": {
      id: "/courses/$courseId/offerings";
      path: "/offerings";
      fullPath: "/courses/$courseId/offerings";
      preLoaderRoute: typeof CoursesCourseIdOfferingsImport;
      parentRoute: typeof CoursesCourseIdImport;
    };
    "/courses/$courseId/prerequisites": {
      id: "/courses/$courseId/prerequisites";
      path: "/prerequisites";
      fullPath: "/courses/$courseId/prerequisites";
      preLoaderRoute: typeof CoursesCourseIdPrerequisitesImport;
      parentRoute: typeof CoursesCourseIdImport;
    };
  }
}

// Create and export the route tree

interface CoursesCourseIdRouteChildren {
  CoursesCourseIdOfferingsRoute: typeof CoursesCourseIdOfferingsRoute;
  CoursesCourseIdPrerequisitesRoute: typeof CoursesCourseIdPrerequisitesRoute;
}

const CoursesCourseIdRouteChildren: CoursesCourseIdRouteChildren = {
  CoursesCourseIdOfferingsRoute: CoursesCourseIdOfferingsRoute,
  CoursesCourseIdPrerequisitesRoute: CoursesCourseIdPrerequisitesRoute,
};

const CoursesCourseIdRouteWithChildren = CoursesCourseIdRoute._addFileChildren(
  CoursesCourseIdRouteChildren,
);

export interface FileRoutesByFullPath {
  "/schedule": typeof ScheduleRoute;
  "/auth/login": typeof AuthLoginRoute;
  "/auth/signup": typeof AuthSignupRoute;
  "/courses/$courseId": typeof CoursesCourseIdRouteWithChildren;
  "/courses": typeof CoursesIndexRoute;
  "/courses/$courseId/offerings": typeof CoursesCourseIdOfferingsRoute;
  "/courses/$courseId/prerequisites": typeof CoursesCourseIdPrerequisitesRoute;
}

export interface FileRoutesByTo {
  "/schedule": typeof ScheduleRoute;
  "/auth/login": typeof AuthLoginRoute;
  "/auth/signup": typeof AuthSignupRoute;
  "/courses/$courseId": typeof CoursesCourseIdRouteWithChildren;
  "/courses": typeof CoursesIndexRoute;
  "/courses/$courseId/offerings": typeof CoursesCourseIdOfferingsRoute;
  "/courses/$courseId/prerequisites": typeof CoursesCourseIdPrerequisitesRoute;
}

export interface FileRoutesById {
  __root__: typeof rootRoute;
  "/schedule": typeof ScheduleRoute;
  "/auth/login": typeof AuthLoginRoute;
  "/auth/signup": typeof AuthSignupRoute;
  "/courses/$courseId": typeof CoursesCourseIdRouteWithChildren;
  "/courses/": typeof CoursesIndexRoute;
  "/courses/$courseId/offerings": typeof CoursesCourseIdOfferingsRoute;
  "/courses/$courseId/prerequisites": typeof CoursesCourseIdPrerequisitesRoute;
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath;
  fullPaths:
    | "/schedule"
    | "/auth/login"
    | "/auth/signup"
    | "/courses/$courseId"
    | "/courses"
    | "/courses/$courseId/offerings"
    | "/courses/$courseId/prerequisites";
  fileRoutesByTo: FileRoutesByTo;
  to:
    | "/schedule"
    | "/auth/login"
    | "/auth/signup"
    | "/courses/$courseId"
    | "/courses"
    | "/courses/$courseId/offerings"
    | "/courses/$courseId/prerequisites";
  id:
    | "__root__"
    | "/schedule"
    | "/auth/login"
    | "/auth/signup"
    | "/courses/$courseId"
    | "/courses/"
    | "/courses/$courseId/offerings"
    | "/courses/$courseId/prerequisites";
  fileRoutesById: FileRoutesById;
}

export interface RootRouteChildren {
  ScheduleRoute: typeof ScheduleRoute;
  AuthLoginRoute: typeof AuthLoginRoute;
  AuthSignupRoute: typeof AuthSignupRoute;
  CoursesCourseIdRoute: typeof CoursesCourseIdRouteWithChildren;
  CoursesIndexRoute: typeof CoursesIndexRoute;
}

const rootRouteChildren: RootRouteChildren = {
  ScheduleRoute: ScheduleRoute,
  AuthLoginRoute: AuthLoginRoute,
  AuthSignupRoute: AuthSignupRoute,
  CoursesCourseIdRoute: CoursesCourseIdRouteWithChildren,
  CoursesIndexRoute: CoursesIndexRoute,
};

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>();

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/schedule",
        "/auth/login",
        "/auth/signup",
        "/courses/$courseId",
        "/courses/"
      ]
    },
    "/schedule": {
      "filePath": "schedule.tsx"
    },
    "/auth/login": {
      "filePath": "auth/login.tsx"
    },
    "/auth/signup": {
      "filePath": "auth/signup.tsx"
    },
    "/courses/$courseId": {
      "filePath": "courses/$courseId.tsx",
      "children": [
        "/courses/$courseId/offerings",
        "/courses/$courseId/prerequisites"
      ]
    },
    "/courses/": {
      "filePath": "courses/index.tsx"
    },
    "/courses/$courseId/offerings": {
      "filePath": "courses/$courseId.offerings.tsx",
      "parent": "/courses/$courseId"
    },
    "/courses/$courseId/prerequisites": {
      "filePath": "courses/$courseId.prerequisites.tsx",
      "parent": "/courses/$courseId"
    }
  }
}
ROUTE_MANIFEST_END */
