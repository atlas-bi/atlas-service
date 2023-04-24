import type { RequestCategory, RequestType, User } from '@prisma/client';
import {
  type ActionArgs,
  type LoaderArgs,
  type Session,
  json,
} from '@remix-run/node';
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from '@remix-run/react';
import { MeiliSearch } from 'meilisearch';
import * as React from 'react';
import RequestTypeEditor from '~/components/RequestTypeEditor';
import {
  createRequestType,
  deleteRequestType,
  editRequestType,
  getRequestTypes,
} from '~/models/config.server';
import { groupIndex } from '~/search.server';
import { authorize, requireUser } from '~/session.server';

type Errors = {
  typeName?: string;
  typeEditorName?: string;
  categoryName?: string;
  categoryDefault?: string;
  typeCreateName?: string;
};

export async function loader({ request, params }: LoaderArgs) {
  return authorize(
    request,
    [process.env.ADMIN_GROUP],
    async ({ user, session }: { user: User; session: Session }) => {
      // should authorizeAdmin here...

      const client = new MeiliSearch({
        host: process.env.MEILISEARCH_URL,
        apiKey: process.env.MEILI_MASTER_KEY,
      });
      const keys = await client.getKeys();

      const requestTypes = await getRequestTypes();
      return json({
        requestTypes,
        user,
        MEILISEARCH_URL: process.env.MEILISEARCH_URL,
        MEILISEARCH_KEY: keys.results.filter(
          (x) => x.name === 'Default Search API Key',
        )[0].key,
        search: { groupIndex },
      });
    },
  );
}

export async function action({ request }: ActionArgs) {
  const user = await requireUser(request);

  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);

  const errors: Errors = {};

  switch (_action) {
    case 'editRequestType': {
      if (typeof values.name !== 'string' || values.name.length === 0) {
        errors.typeEditorName = 'Name is required';
        errors.id = Number(values.id);
      }
      if (Object.keys(errors).length > 0) {
        return json({ errors }, { status: 400 });
      }

      const {
        id,
        name,
        description,
        menuText,
        textFieldOneTitle,
        textFieldTwoTitle,
        textFieldThreeTitle,
        textFieldFourTitle,
        textFieldFiveTitle,
        booleanFieldOneTitle,
        booleanFieldTwoTitle,
        booleanFieldThreeTitle,
        userFieldOneTitle,
        userFieldTwoTitle,
        userFieldThreeTitle,
        labelsTitle,
        requesterTitle,
      } = values;

      await editRequestType({
        id: Number(id),
        name,
        description,
        menuText,
        /* groups */
        textFieldOneGroups: formData.getAll('textFieldOneGroups'),
        textFieldTwoGroups: formData.getAll('textFieldTwoGroups'),
        textFieldThreeGroups: formData.getAll('textFieldThreeGroups'),
        textFieldFourGroups: formData.getAll('textFieldFourGroups'),
        textFieldFiveGroups: formData.getAll('textFieldFiveGroups'),
        booleanFieldOneGroups: formData.getAll('booleanFieldOneGroups'),
        booleanFieldTwoGroups: formData.getAll('booleanFieldTwoGroups'),
        booleanFieldThreeGroups: formData.getAll('booleanFieldThreeGroups'),
        userFieldOneGroups: formData.getAll('userFieldOneGroups'),
        userFieldTwoGroups: formData.getAll('userFieldTwoGroups'),
        userFieldThreeGroups: formData.getAll('userFieldThreeGroups'),
        requesterGroups: formData.getAll('requesterGroups'),
        labelsGroups: formData.getAll('labelsGroups'),
        showTextFieldOne: values.showTextFieldOne === 'on',
        showTextFieldTwo: values.showTextFieldTwo === 'on',
        showTextFieldThree: values.showTextFieldThree === 'on',
        showTextFieldFour: values.showTextFieldFour === 'on',
        showTextFieldFive: values.showTextFieldFive === 'on',
        showBooleanFieldOne: values.showBooleanFieldOne === 'on',
        showBooleanFieldTwo: values.showBooleanFieldTwo === 'on',
        showBooleanFieldThree: values.showBooleanFieldThree === 'on',
        showUserFieldOne: values.showUserFieldOne === 'on',
        showUserFieldTwo: values.showUserFieldTwo === 'on',
        showUserFieldThree: values.showUserFieldThree === 'on',
        showRequester: values.showRequester === 'on',
        showLabels: values.showLabels === 'on',
        requireTextFieldOne: values.requireTextFieldOne === 'on',
        requireTextFieldTwo: values.requireTextFieldTwo === 'on',
        requireTextFieldThree: values.requireTextFieldThree === 'on',
        requireTextFieldFour: values.requireTextFieldFour === 'on',
        requireTextFieldFive: values.requireTextFieldFive === 'on',
        requireUserFieldOne: values.requireUserFieldOne === 'on',
        requireUserFieldTwo: values.requireUserFieldTwo === 'on',
        requireUserFieldThree: values.requireUserFieldThree === 'on',
        textFieldOneTitle,
        textFieldTwoTitle,
        textFieldThreeTitle,
        textFieldFourTitle,
        textFieldFiveTitle,
        booleanFieldOneTitle,
        booleanFieldTwoTitle,
        booleanFieldThreeTitle,
        userFieldOneTitle,
        userFieldTwoTitle,
        userFieldThreeTitle,
        labelsTitle,
        requesterTitle,
      });

      break;
    }
    case 'createRequestType': {
      if (typeof values.name !== 'string' || values.name.length === 0) {
        errors.typeCreateName = 'Name is required';
      }
      if (Object.keys(errors).length > 0) {
        return json({ errors }, { status: 400 });
      }
      const {
        name,
        description,
        menuText,
        textFieldOneTitle,
        textFieldTwoTitle,
        textFieldThreeTitle,
        textFieldFourTitle,
        textFieldFiveTitle,
        booleanFieldOneTitle,
        booleanFieldTwoTitle,
        booleanFieldThreeTitle,
        userFieldOneTitle,
        userFieldTwoTitle,
        userFieldThreeTitle,
        labelsTitle,
        requesterTitle,
      } = values;

      await createRequestType({
        name: name.toString(),
        name,
        description,
        menuText,
        /* groups */
        textFieldOneGroups: formData.getAll('textFieldOneGroups'),
        textFieldTwoGroups: formData.getAll('textFieldTwoGroups'),
        textFieldThreeGroups: formData.getAll('textFieldThreeGroups'),
        textFieldFourGroups: formData.getAll('textFieldFourGroups'),
        textFieldFiveGroups: formData.getAll('textFieldFiveGroups'),
        booleanFieldOneGroups: formData.getAll('booleanFieldOneGroups'),
        booleanFieldTwoGroups: formData.getAll('booleanFieldTwoGroups'),
        booleanFieldThreeGroups: formData.getAll('booleanFieldThreeGroups'),
        userFieldOneGroups: formData.getAll('userFieldOneGroups'),
        userFieldTwoGroups: formData.getAll('userFieldTwoGroups'),
        userFieldThreeGroups: formData.getAll('userFieldThreeGroups'),
        requesterGroups: formData.getAll('requesterGroups'),
        labelsGroups: formData.getAll('labelsGroups'),
        showTextFieldOne: values.showTextFieldOne === 'on',
        showTextFieldTwo: values.showTextFieldTwo === 'on',
        showTextFieldThree: values.showTextFieldThree === 'on',
        showTextFieldFour: values.showTextFieldFour === 'on',
        showTextFieldFive: values.showTextFieldFive === 'on',
        showBooleanFieldOne: values.showBooleanFieldOne === 'on',
        showBooleanFieldTwo: values.showBooleanFieldTwo === 'on',
        showBooleanFieldThree: values.showBooleanFieldThree === 'on',
        showUserFieldOne: values.showUserFieldOne === 'on',
        showUserFieldTwo: values.showUserFieldTwo === 'on',
        showUserFieldThree: values.showUserFieldThree === 'on',
        showRequester: values.showRequester === 'on',
        showLabels: values.showLabels === 'on',
        requireTextFieldOne: values.requireTextFieldOne === 'on',
        requireTextFieldTwo: values.requireTextFieldTwo === 'on',
        requireTextFieldThree: values.requireTextFieldThree === 'on',
        requireTextFieldFour: values.requireTextFieldFour === 'on',
        requireTextFieldFive: values.requireTextFieldFive === 'on',
        requireUserFieldOne: values.requireUserFieldOne === 'on',
        requireUserFieldTwo: values.requireUserFieldTwo === 'on',
        requireUserFieldThree: values.requireUserFieldThree === 'on',
        textFieldOneTitle,
        textFieldTwoTitle,
        textFieldThreeTitle,
        textFieldFourTitle,
        textFieldFiveTitle,
        booleanFieldOneTitle,
        booleanFieldTwoTitle,
        booleanFieldThreeTitle,
        userFieldOneTitle,
        userFieldTwoTitle,
        userFieldThreeTitle,
        labelsTitle,
        requesterTitle,
        userId: user.id,
      });

      break;
    }
    case 'deleteRequestType': {
      await deleteRequestType({ id: Number(values.id) });
      break;
    }
    default: {
      console.log(`Unknown action ${_action}`);
      break;
      // throw new Error(`Unknown action ${_action}`);
    }
  }

  return null;
}

export default function Index() {
  const { requestTypes, MEILISEARCH_URL, MEILISEARCH_KEY, search } =
    useLoaderData<typeof loader>();

  type ActionData = { errors?: Errors } | undefined | null;
  const actionData = useActionData<ActionData>();

  const typeNameRef = React.useRef<HTMLInputElement>(null);
  const [newTypeHidden, setNewTypeHidden] = React.useState(false);

  const transition = useNavigation();

  const isCreatingType =
    transition.state === 'submitting' &&
    transition.formData.get('_action') === 'createRequestType';

  React.useEffect(() => {
    if (!isCreatingType) {
      setNewTypeHidden(false);
    }
  }, [isCreatingType]);

  React.useEffect(() => {
    if (actionData?.errors?.typeName) {
      typeNameRef.current?.focus();
    }
  }, [actionData]);

  return (
    <>
      <h2 className="is-3 title">Request Types</h2>
      {requestTypes?.length > 0 &&
        requestTypes.map((rt: RequestType) => (
          <RequestTypeEditor
            key={rt.id}
            rt={rt}
            MEILISEARCH_URL={MEILISEARCH_URL}
            MEILISEARCH_KEY={MEILISEARCH_KEY}
            searchIndex={search.groupIndex}
          />
        ))}
      <RequestTypeEditor
        MEILISEARCH_URL={MEILISEARCH_URL}
        MEILISEARCH_KEY={MEILISEARCH_KEY}
        searchIndex={search.groupIndex}
      />
    </>
  );
}
