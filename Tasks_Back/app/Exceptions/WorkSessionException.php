<?php

namespace App\Exceptions;

/**
 * Business-rule violation inside the Work Sessions module.
 * Controllers map this to a 400 response with the exception message.
 */
class WorkSessionException extends \DomainException
{
}
