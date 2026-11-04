import Skeleton from "react-loading-skeleton";
import { MaxWidthWrapper } from "@/components";
import { Button } from "@/components/ui";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

const BillingLoading = () => (
  <MaxWidthWrapper className="max-w-5xl">
    <div className="mt-12">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan</CardTitle>

          <CardDescription>
            <Skeleton width={220} />
          </CardDescription>
        </CardHeader>

        <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
          <Button disabled className="w-36" />
        </CardFooter>
      </Card>
    </div>
  </MaxWidthWrapper>
);

export default BillingLoading;
