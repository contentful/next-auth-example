import { compare, genSalt, hash } from "bcrypt";
import { createClient } from "contentful-management";

const LOCALE = "en-US";
const ENVIRONMENT_ID = "master";
const CONTENT_TYPE_ID = "users";

const { CF_SPACE_ID, CF_CMA_TOKEN } = process.env;

const cmaClient = createClient(
  {
    space: CF_SPACE_ID!,
    accessToken: CF_CMA_TOKEN!,
  },
  {
    type: "plain",
  }
);

const createUser = async (email: string, hash: string) => {
  const createdUser = await cmaClient.entry.create(
    {
      spaceId: CF_SPACE_ID!,
      environmentId: ENVIRONMENT_ID,
      contentTypeId: CONTENT_TYPE_ID,
    },
    {
      fields: {
        email: {
          [LOCALE]: email,
        },
        password: {
          [LOCALE]: hash,
        },
      },
    }
  );

  return {
    id: createdUser.sys.id,
    email,
  };
};

export const getOrCreateUser = async (email: string, password: string) => {
  const user = await cmaClient.entry.getMany({
    spaceId: CF_SPACE_ID!,
    environmentId: ENVIRONMENT_ID,
    "fields.email[match]": email,
  });

  if (user.total === 1) {
    const { password: userPassword } = user.items[0].fields;
    const isValid = await compare(password, userPassword[LOCALE]);

    if (isValid) {
      return {
        id: user.items[0].sys.id,
        email,
      };
    }
    throw new Error("Wrong credentials. Try again");
  }
  const hashedPassword = await hash(password, await genSalt(12));
  return createUser(email, hashedPassword);
};
