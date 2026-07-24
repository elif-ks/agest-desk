import { Link, useIntl } from '@umijs/max';
import React from 'react';

import { Button, Card, ResultView } from '@/components/ui';
import { NotFoundIcon } from '@/components/ui/icons';

const Exception404: React.FC = () => {
  const intl = useIntl();
  return (
    <Card>
      <ResultView
        status="404"
        title="404"
        description={intl.formatMessage({ id: 'pages.404.subTitle' })}
        icon={<NotFoundIcon />}
        actions={
          <Link to="/" prefetch>
            <Button variant="primary">
              {intl.formatMessage({ id: 'pages.404.buttonText' })}
            </Button>
          </Link>
        }
      />
    </Card>
  );
};

export default Exception404;
